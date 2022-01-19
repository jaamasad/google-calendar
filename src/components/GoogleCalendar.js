import React, { useEffect, useState } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import googleCalendarPlugin from "@fullcalendar/google-calendar"
import $ from 'jquery'
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap"
const CLIENT_ID =
  "800666244265-lto1ep2f97vs2ts40omitb1ko1ckjq8v.apps.googleusercontent.com"
const API_KEY = "AIzaSyCfAHxZMKrG-t6CBNDfU9DHyXb6fNtL2xw"
const SCOPES =
  "https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar"

const GoogleCalendar = () => {
  const [login, setLogin] = useState(false)
  const [events, setEvents] = useState(null)
  const [eventTitle, setEventTitle] = useState(null)
  const [eventDesc, setEventDesc] = useState(null)
  const [modal, setModal] = useState(false)

  useEffect(() => {
    var calendarid = 'jaamasad1@gmail.com'; 
    
    $.ajax({
        type: 'GET',
        url: encodeURI('https://www.googleapis.com/calendar/v3/calendars/' + calendarid+ '/events?key=' + API_KEY),
        dataType: 'json',
        success: function (response) {
          setEvents(formatEvents(response.items))        },
        error: function (response) {
        }
    });    
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

  const logout=()=> {
    localStorage.removeItem("access_token")
  }

  const openSignInPopup = () => {
    window.gapi.auth2.authorize(
      { client_id: CLIENT_ID, scope: SCOPES },
      (res) => {
        console.log(res)
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
      let today = new Date()
      var monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ]
      // let dateStr = prompt('Enter a start date ');
      var dateStr = prompt(
        "Please enter date.",
        today.getDate() +
          "-" +
          monthNames[today.getMonth()] +
          "-" +
          today.getFullYear()
      )
      let dateEnd = prompt("Enter a end date")
      let title = prompt("Enter title")
      let description = prompt("Enter disc")
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
              dateTime: new Date(dateEnd),
            },
            start: {
              dateTime: new Date(dateStr),
            },
            summary: title,
            description: description,
          }),
        }
      )
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

  return (
    <div className="calander-container">
      <div className="button-container">
      {login && <button onClick={addEvent}>Add event</button>}
      {!login ? <button onClick={signin}>Sign In</button>:
       <button onClick={logout}>Logout</button>}
      </div>
      {console.log(events)}
      <FullCalendar
        plugins={[dayGridPlugin, googleCalendarPlugin]}
        initialView="dayGridMonth"
        events={events}
        GoogleCalendarApikey={API_KEY}
        eventClick={handleEventClick}
      />
      <Modal
        isOpen={modal}
        className="Eventmodel"
      >
        <Button color="secondary" onClick={handelCancel}>
              X
            </Button>
            <ModalHeader>
           <label>Title:</label><br />
            {eventTitle}
          </ModalHeader>
          <ModalBody>
            <div>
              <p>
              <label>Description:</label><br />  

              {eventDesc ? eventDesc :"this event has no summary"}
              </p>
            </div>
          </ModalBody>
      </Modal>
    </div>
  )
}

export default GoogleCalendar
