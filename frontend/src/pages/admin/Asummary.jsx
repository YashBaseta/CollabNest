import { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { AuthContext } from "../../context/AuthContext";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css"; // default styles

const Asummary = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { user, setUser } = useContext(AuthContext);
  const USer = user?.role;

  const handleViewTask = () => {
    navigate(`/${USer}/projects/${projectId}/tasks`);
  };
  const taskData = [
    { name: "Upcoming", value: 40, color: "#9333ea" },
    { name: "In Progress", value: 35, color: "#34d399" },
    { name: "Completed", value: 25, color: "#fbbf24" },
  ];
  const [selectedDate, setSelectedDate] = useState(new Date());

  const activityData = [
    { day: "Mon", tasks: 60 },
    { day: "Tue", tasks: 80 },
    { day: "Wed", tasks: 50 },
    { day: "Thu", tasks: 90 },
    { day: "Fri", tasks: 70 },
    { day: "Sat", tasks: 30 },
    { day: "Sun", tasks: 20 },
  ];

  const hoursData = [
    { day: "Mon", hours: 8 },
    { day: "Tue", hours: 10 },
    { day: "Wed", hours: 7 },
    { day: "Thu", hours: 8 },
    { day: "Fri", hours: 9 },
  ];

  const schedule = [
    {
      date: "2 May",
      title: "Team Meeting: Project Angelike Update",
      time: "9:00 AM",
      color: "bg-blue-400",
    },
    {
      date: "2 May",
      title: "Client Presentation: New Product Line",
      time: "10:00 AM",
      color: "bg-green-400",
    },
    {
      date: "2 May",
      title: "Weekly Planning Session",
      time: "4:00 PM",
      color: "bg-purple-300",
    },
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex gap-6">
      {/* Left Column */}
      <div className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-gray-500">You have 6 tasks today</p>
          </div>
          <button
            onClick={handleViewTask}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition"
          >
            View Task
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-white rounded-xl shadow text-center">
            <p className="text-2xl font-bold text-red-500 ">25</p>
            <p className="text-gray-500">Backlog</p>
          </div>
          <div className="p-4 bg-white rounded-xl shadow text-center">
            <p className="text-2xl font-bold text-blue-500">10</p>
            <p className="text-gray-500">In Progress</p>
          </div>
          <div className="p-4 bg-white rounded-xl shadow text-center">
            <p className="text-2xl font-bold text-green-500">13</p>
            <p className="text-gray-500">Completed</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-xl shadow">
            <h3 className="text-lg font-bold mb-2">Task Summary</h3>
            <PieChart width={250} height={200}>
              <Pie
                data={taskData}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {taskData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </div>

          <div className="p-4 bg-white rounded-xl shadow col-span-2">
            <h3 className="text-lg font-bold mb-2">Task Activity</h3>
            <LineChart width={490} height={200} data={activityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="tasks"
                stroke="#d8b4fe"
                strokeWidth={2}
              />
            </LineChart>
          </div>
        </div>

        <div className="mt-6 p-4 bg-white rounded-xl shadow">
          <h3 className="text-lg font-bold mb-2">Hours Spent</h3>
          <BarChart width={500} height={200} data={hoursData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="hours" fill="#1d4ed8" />
          </BarChart>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-80 space-y-6">
        {/* Interactive Calendar */}
        <div className="p-4 bg-white rounded-xl shadow w-atuo mx-auto">
          <h3 className="text-lg font-bold text-orange-500 mb-4 text-center">
            {selectedDate.toLocaleString("default", {
              month: "long",
              year: "numeric",
            })}
          </h3>

          <Calendar
            onChange={setSelectedDate}
            value={selectedDate}
            className="rounded-lg overflow-hidden"
            tileClassName={({ date, view }) =>
              date.toDateString() === new Date().toDateString()
                ? "bg-blue-100 text-black rounded"
                : ""
            }
          />
        </div>

        {/* Schedule */}
        <div className="p-4 bg-white rounded-xl shadow">
          <h3 className="text-lg font-bold mb-4">Schedule</h3>
          {schedule.map((item, idx) => (
            <div key={idx} className={`mb-3 p-3 rounded ${item.color}`}>
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="text-xs text-gray-600">{item.time}</p>
            </div>
          ))}
        </div>

        {/* Reminder */}
      </div>
    </div>
  );
};

export default Asummary;
