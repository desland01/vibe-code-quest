export type LegalSection = {
  heading: string;
  paragraphs: readonly string[];
  items?: readonly string[];
};

export type LegalDocument = {
  title: string;
  lastUpdated: string;
  sections: readonly LegalSection[];
};
