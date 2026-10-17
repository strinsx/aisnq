import {
  columnVisibilityFeature,
  tableFeatures,
} from "@tanstack/react-table";

export const dataTableFeatures = tableFeatures({
  columnVisibilityFeature,
});
export type DataTableFeatures = typeof dataTableFeatures;
