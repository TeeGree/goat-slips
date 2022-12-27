export const getSundayDateForDate = (date: Date) => {
    const currentDay = date.getDay();
    const calculatedSundayDate = new Date(date);
    calculatedSundayDate.setDate(calculatedSundayDate.getDate() - currentDay);
    return calculatedSundayDate;
};
