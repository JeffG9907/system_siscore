import React, { useEffect, useState } from "react";
import DateFilter from "./Shared/DateFilter";
import { getDashboardData } from "../services/api";

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [dates, setDates] = useState({ start: "", end: "" });

  useEffect(() => {
    getDashboardData(dates.start, dates.end).then(setData);
  }, [dates]);

  // Aquí puedes usar una librería como recharts para mostrar los datos en un gráfico
  return (
    <div>
      <h2>Dashboard</h2>
      <DateFilter dates={dates} setDates={setDates} />
      {/* Aquí iría tu gráfico cortes vs reconexiones */}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default Dashboard;