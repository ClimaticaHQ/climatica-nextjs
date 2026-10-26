#!/bin/sh
# Recreates the `cities` core from the repository's solrconfig.xml, empty and with Solr's default
# schema; `npm run solr:reindex` then applies schema.json and imports the cities.
#
# A core keeps its own copy of solrconfig.xml, made when it's created, so a RELOAD never picks up
# a change to the repository's file. Nor does the container's configset: it's a single-file bind
# mount, and replacing the file on the host (git checkout, git reset) leaves a running container
# reading the old one. So the new core is created from a fresh copy of the default configset with
# the repository's solrconfig.xml copied in.
#
# Usage (from the repository root): npm run solr:recreate-core
set -eu

CONTAINER=climatica-solr
CORE=cities
CONF_DIR=/tmp/cities-conf
SOLR_INSTALL=/opt/solr
DEFAULT_CONF=$SOLR_INSTALL/server/solr/configsets/_default/conf
ICU_JARS="$SOLR_INSTALL/contrib/analysis-extras/lib/icu4j-*.jar $SOLR_INSTALL/contrib/analysis-extras/lucene-libs/lucene-analyzers-icu-*.jar"
SOLR_CONFIG="$(dirname "$0")/../solrconfig.xml"

# * the ICU libraries solrconfig.xml loads, so a missing contrib fails here, not mid-import
if ! docker exec "$CONTAINER" sh -c "ls $ICU_JARS" > /dev/null; then
  echo "The ICU libraries solrconfig.xml loads are missing from $CONTAINER's Solr image." >&2
  exit 1
fi

echo "Unloading the $CORE core (index and instance directory removed)..."
docker exec "$CONTAINER" curl -sf \
  "http://localhost:8983/solr/admin/cores?action=UNLOAD&core=$CORE&deleteIndex=true&deleteDataDir=true&deleteInstanceDir=true" \
  > /dev/null || echo "  (no $CORE core to unload)"

echo "Creating the $CORE core from the repository's solrconfig.xml..."
docker exec "$CONTAINER" sh -c "rm -rf $CONF_DIR && cp -r $DEFAULT_CONF $CONF_DIR"
docker cp "$SOLR_CONFIG" "$CONTAINER:$CONF_DIR/solrconfig.xml"
docker exec "$CONTAINER" solr create_core -c "$CORE" -d "$CONF_DIR"
docker exec "$CONTAINER" rm -rf "$CONF_DIR"
