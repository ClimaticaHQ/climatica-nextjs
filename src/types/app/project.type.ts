/** One person on the About page; the role is a key of info.about.team.roles. */
export type TTeamMember = {
  id: string;
  name: string;
  roleKey: string;
  /** where they work, built from PROPER_NAMES — not translated */
  affiliation: string;
  /** their profile page: the name on the card links to it */
  profileUrl: string;
};

/**
 * Who makes Climatica and where to find and cite it. An empty string hides the element that
 * shows it, so the pages work before a value (the paper's citation) exists.
 */
export type TProjectInfo = {
  repositoryUrl: string;
  changelogUrl: string;
  licence: string;
  scrapiAuthor: string;
  /** their profile; empty: the name without a link */
  scrapiAuthorUrl: string;
  scrapiDocsUrl: string;
  citation: string;
  bibtex: string;
};
