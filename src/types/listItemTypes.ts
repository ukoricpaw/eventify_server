type DeadlineType = {
  type: 'deadline';
  content: Date;
};

type DescriptionType = {
  type: 'description';
  content: string;
};

type NameType = {
  type: 'name';
  content: string;
};

export type InfoItemType = DeadlineType | DescriptionType | NameType;
