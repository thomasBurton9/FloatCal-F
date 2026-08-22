import { CalendarItem } from "./calendarItems";

export type SearchModalProps = {
  isVisible: boolean;
  setCurrentModal: (value: string | null) => void;
  userId: number;
  onItemPress: (item: CalendarItem) => void;
};

export type SearchResultProps = {
  item: CalendarItem;
  onPress: () => void;
};
