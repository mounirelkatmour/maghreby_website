// Utility to check if two date ranges overlap
export function isDateRangeOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
) {
  return start1 <= end2 && start2 <= end1;
}
