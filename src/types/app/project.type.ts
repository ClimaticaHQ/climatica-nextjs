export type TTeamMember = {
  id: string;
  name: string;
  roleKey: string;
  affiliation: string;
  profileUrl: string;
};

/** an empty string hides the element that shows it, so the pages work before a value exists */
export type TProjectInfo = {
  repositoryUrl: string;
  changelogUrl: string;
  licence: string;
  scrapiAuthor: string;
  scrapiAuthorUrl: string;
  scrapiDocsUrl: string;
  citation: string;
  bibtex: string;
};
