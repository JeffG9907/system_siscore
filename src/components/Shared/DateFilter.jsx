import React from "react";

const DateFilter = ({ dates, setDates }) => (
  <div>
    <label>Desde: <input type="date" value={dates.start} onChange={e => setDates({ ...dates, start: e.target.value })} /></label>
    <label>Hasta: <input type="date" value={dates.end} onChange={e => setDates({ ...dates, end: e.target.value })} /></label>
  </div>
);

export default DateFilter;