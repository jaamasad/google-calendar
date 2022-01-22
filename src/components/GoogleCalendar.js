import React, { useEffect, useState } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import googleCalendarPlugin from "@fullcalendar/google-calendar"
import $ from "jquery"
// import { Button, Modal, ModalHeader, ModalBody } from "reactstrap"
import Modal from "react-modal"

const CLIENT_ID =
  "592443710560-iv53i6i8n8q1q9v53tat6qg4dmps3knp.apps.googleusercontent.com"
const API_KEY = "AIzaSyABMZUitJ-kKdMQg5u-gg5RcBRjeNrv4tU"
const SCOPES =
  "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar"

const GoogleCalendar = () => {
  const [login, setLogin] = useState(false)
  const [events, setEvents] = useState(null)
  const [eventTitle, setEventTitle] = useState(null)
  const [eventDesc, setEventDesc] = useState(null)
  const [modal, setModal] = useState(false)
  const [addEventModal, setAddEventModal] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
  })

  const handleEventChange = (e) => {
    const { name, value } = e.target
    setNewEvent({
      ...newEvent,
      [name]: value,
    })
  }

  useEffect(() => {
    if (localStorage.getItem("access_token")) setLogin(true)
    var calendarid = "jamkhawar03027867415@gmail.com"

    $.ajax({
      type: "GET",
      url: encodeURI(
        "https://www.googleapis.com/calendar/v3/calendars/" +
          calendarid +
          "/events?key=" +
          API_KEY
      ),
      dataType: "json",
      success: function (response) {
        setEvents(formatEvents(response.items))
        // console.log(events)
      },

      error: function (response) {},
    })
  })

  const signin = () => {
    setLogin(true)
    const script = document.createElement("script")
    script.async = true
    script.defer = true
    script.src = "https://apis.google.com/js/api.js"

    document.body.appendChild(script)

    script.addEventListener("load", () => {
      if (window.gapi) handleClientLoad()
    })
  }

  const logout = () => {
    localStorage.removeItem("access_token")
    setLogin(false)
  }

  const openSignInPopup = () => {
    window.gapi.auth2.authorize(
      { client_id: CLIENT_ID, scope: SCOPES },
      (res) => {
        if (res) {
          console.log(window.gapi.client, res)

          if (res.access_token)
            localStorage.setItem("access_token", res.access_token)
          fetch(
            `https://www.googleapis.com/calendar/v3/users/me/calendarList?access_token=${res.access_token}`
          )
            .then((res) => res.json())
            .then((data) =>
              localStorage.setItem("calendarId", data.items[0].id)
            )
        }
      }
    )
  }

  const handleClientLoad = () => {
    window.gapi.load("client:auth2", initClient)
  }
  const initClient = () => {
    if (!localStorage.getItem("access_token")) {
      openSignInPopup()
    } else {
      fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?key=${API_KEY}&orderBy=startTime&singleEvents=true`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      )
        .then((res) => {
          if (res.status !== 401) {
            return res.json()
          } else {
            localStorage.removeItem("access_token")

            openSignInPopup()
          }
        })
        .then((data) => {
          if (data?.items) {
            setEvents(formatEvents(data.items))
          }
        })
    }
  }

  const listUpcomingEvents = () => {
    window.gapi.client.calendar.events
      .list({
        calendarId: "primary",
        showDeleted: true,
        singleEvents: true,
      })
      .then(function (response) {
        var events = response.result.items
        if (events.length > 0) {
          setEvents(formatEvents(events))
        }
      })
  }

  const formatEvents = (list) => {
    return list.map((item) => ({
      title: item.summary,
      disc: item.description,
      start: item.start.dateTime || item.start.date,
      end: item.end.dateTime || item.end.date,
    }))
  }

  const addEvent = () => {
    if (window.gapi.client || localStorage.getItem("access_token")) {
      fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?key=${API_KEY}&timeMax=${new Date(
          "Apr 01, 2021"
        ).toISOString()}&timeMin=${new Date("Apr 01, 2021").toISOString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      )
        .then((res) => res.json())
        .then((data) => console.log(data))
      fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?key=${API_KEY}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: JSON.stringify({
            end: {
              dateTime: new Date(newEvent.endDate),
            },
            start: {
              dateTime: new Date(newEvent.startDate),
            },
            summary: newEvent.title,
            description: newEvent.description,
          }),
        }

      )
      setAddEventModal(false)
    }
  }

  const handelCancel = () => {
    setModal(false)
  }

  const handleEventClick = ({ event, el }) => {
    setModal(true)
    setEventTitle(event._def.title)
    setEventDesc(event._def.extendedProps.disc)
  }

  // const toggleModal = () => {
  //   setModal(!modal)
  //   setAddEventModal(!addEventModal)
  // }

  return (
    <div className="calander-container">
      <div className="button-container">
        {login && (
          <button onClick={() => setAddEventModal(true)}>Add event</button>
        )}
        {!login ? (
          <button onClick={signin}>Sign In</button>
        ) : (
          <button onClick={logout}>Logout</button>
        )}
      </div>
      <FullCalendar
        plugins={[dayGridPlugin, googleCalendarPlugin]}
        initialView="dayGridMonth"
        events={events}
        GoogleCalendarApikey={API_KEY}
        eventClick={handleEventClick}
      />
      <Modal 
       isOpen={addEventModal}
       contentLabel="My dialog"
       className="mymodal"
       overlayClassName="myoverlay-event"
       closeTimeoutMS={500}
          >
       <div>
            <div className="date-input-container">
              <div className="input-label">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  value={newEvent.title}
                  onChange={handleEventChange}
                  placeholder="Enter Title"
                />
              </div>
              <div className="input-label">
                <label>Enter Description</label>
                <input
                  type="text"
                  name="description"
                  value={newEvent.description}
                  placeholder="Enter Descrition"
                  onChange={handleEventChange}
                />
              </div>
            </div>
            <div className="date-input-container">
              <div className="input-label">
                <label htmlFor="">Enter Start Date</label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={newEvent.startDate}
                  placeholder="start date"
                  onChange={handleEventChange}
                />
              </div>
              <div className="input-label">
                <label htmlFor="">Enter End Date</label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={newEvent.endDate}
                  placeholder="end date"
                  onChange={handleEventChange}
                />
              </div>
            </div>
            <div className="popup-button-container">
         
            <button onClick={addEvent}>Add Event</button>
            <button  onClick={() => setAddEventModal(false)}>Close</button>
            </div>
          </div>
      </Modal>

      <Modal
        isOpen={modal}
        contentLabel="My dialog"
        className="mymodal"
        overlayClassName="myoverlay"
        closeTimeoutMS={500}
      >
        <div className="label-t-d">
          <label>Event Title:</label>
          <p>{eventTitle}</p>
        </div>
        <div className="label-t-d">
          <label>Event Description:</label>
          <p>  {eventDesc ? eventDesc : "this event has no summary"} </p>
        </div>
        <div className="event-close-btn" >
        <button onClick={handelCancel}>
          Close
        </button>
        </div>
       
      </Modal>

      {/* <Modal isOpen={modal} className="Eventmodel">
        <Button color="secondary" onClick={handelCancel}>
          X
        </Button>
        <ModalHeader>
          <label>Title:</label>
          <br />
          {eventTitle}
        </ModalHeader>
        <ModalBody>
          <div>
            <p>
              <label>Description:</label>
              <br />
              {eventDesc ? eventDesc : "this event has no summary"}
            </p>
          </div>
        </ModalBody>
      </Modal> */}
    </div>
  )
}

export default GoogleCalendar
