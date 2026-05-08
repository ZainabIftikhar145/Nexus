import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './calendar.css';
import { useAuth } from '../../context/AuthContext';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface MeetingRequest {
  id: number;
  date: Date;
  time: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'declined';
}

const CalendarView = () => {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [meetings, setMeetings] = useState<MeetingRequest[]>([]);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');

  const handleDateChange = (value: Value) => {
    if (value instanceof Date) {
      setSelectedDate(value);
    }
  };

  const sendMeetingRequest = () => {
    if (!user || !selectedTime) return;
    
    const newRequest: MeetingRequest = {
      id: Date.now(),
      date: selectedDate,
      time: selectedTime,
      fromUserId: user.id,
      fromUserName: user.name,
      toUserId: 'entrepreneur-id',
      status: 'pending'
    };
    
    setMeetings([...meetings, newRequest]);
    setShowRequestForm(false);
    setSelectedTime('');
    alert('Meeting request sent!');
  };

  const acceptRequest = (id: number) => {
    setMeetings(meetings.map(meeting => 
      meeting.id === id ? { ...meeting, status: 'accepted' } : meeting
    ));
    alert('Meeting request accepted!');
  };

  const declineRequest = (id: number) => {
    setMeetings(meetings.map(meeting => 
      meeting.id === id ? { ...meeting, status: 'declined' } : meeting
    ));
    alert('Meeting request declined');
  };

  const isInvestor = user?.role === 'investor';
  const isEntrepreneur = user?.role === 'entrepreneur';

  const myMeetings = meetings.filter(meeting => 
    meeting.toUserId === user?.id || meeting.fromUserId === user?.id
  );

  return (
    <div className="p-6 bg-gray-900 rounded-lg">
      <h2 className="text-2xl font-bold text-white mb-4">Meeting Scheduler</h2>
      
      <div className="mb-6">
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          className="react-calendar-dark"
        />
      </div>

      <div className="mb-4 text-white">
        Selected: {selectedDate.toDateString()}
      </div>

      {isInvestor && !showRequestForm && (
        <button
          onClick={() => setShowRequestForm(true)}
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          + Schedule a Meeting
        </button>
      )}

      {isInvestor && showRequestForm && (
        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-white mb-3">Schedule Meeting</h3>
          <div className="flex gap-2 flex-wrap mb-3">
            {['10:00 AM', '11:00 AM', '12:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'].map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`px-3 py-1 rounded transition ${
                  selectedTime === time 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {time}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={sendMeetingRequest}
              disabled={!selectedTime}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              Send Request
            </button>
            <button
              onClick={() => {
                setShowRequestForm(false);
                setSelectedTime('');
              }}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-xl font-semibold text-white mb-3">
          {isInvestor ? 'Sent Requests' : 'Meeting Requests'}
        </h3>
        
        {myMeetings.length === 0 ? (
          <p className="text-gray-400">No meeting requests</p>
        ) : (
          <ul className="space-y-2">
            {myMeetings.map((meeting) => (
              <li key={meeting.id} className="bg-gray-800 p-3 rounded flex justify-between items-center flex-wrap gap-2">
                <div>
                  <p className="text-white">
                    {meeting.date.toDateString()} at {meeting.time}
                  </p>
                  <p className="text-sm text-gray-400">
                    {meeting.fromUserId === user?.id 
                      ? `Requested to: ${meeting.toUserId}` 
                      : `From: ${meeting.fromUserName}`}
                  </p>
                </div>
                
                <div className="flex gap-2 items-center">
                  {meeting.status === 'pending' && isEntrepreneur && (
                    <>
                      <button
                        onClick={() => acceptRequest(meeting.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => declineRequest(meeting.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                      >
                        Decline
                      </button>
                    </>
                  )}
                  
                  <span className={`px-2 py-1 rounded text-sm ${
                    meeting.status === 'pending' ? 'bg-yellow-600' : 
                    meeting.status === 'accepted' ? 'bg-green-600' : 'bg-red-600'
                  }`}>
                    {meeting.status}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CalendarView; 