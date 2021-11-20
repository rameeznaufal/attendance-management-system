import "./App.css";
import { useEffect, useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { BeatLoader } from "react-spinners";
import uuid from "react-uuid";
import Home from "./pages/Home.js";
import Sidebar from "./components/Sidebar";
import Notes from "./components/Note.js";
import Navbar from "./components/Navbar.js";
import "./custom.scss";

function App() {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState("");

  const handleLogOut = async () => {
    setUser(null);
    await fetch(
      process.env.REACT_APP_API_URL +
        "/users/logout",
      {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        method: "POST",
      }
    );
    setNotes([]);
  };

  const makeUser = (obj) => {
    setUser(obj);
  };

  const updateNote = async (updatedNote) => {
    let res = await fetch(
      process.env.REACT_APP_API_URL +
        "/users/" +
        user.id +
        "/notes/" +
        updatedNote.server_id,
      {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        method: "PUT",
        body: JSON.stringify({
          title: updatedNote.title,
          note: updatedNote.note,
          last_edited: updatedNote.last_edited,
          tags: updatedNote.tags,
        }),
      }
    );
    if (!res.ok) {
      console.log("Error in updating note");
    }
  };

  const onUpdateNote = (updatedNote) => {
    const updatedNotesArr = notes.map((note) => {
      return note.client_id === updatedNote.client_id ? updatedNote : note;
    });
    setNotes(updatedNotesArr);
  };

  const addNote = async (addedNote) => {
    let res = await fetch(
      process.env.REACT_APP_API_URL + "/users/" + user.id + "/notes/",
      {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        method: "POST",
        body: JSON.stringify({
          title: addedNote.title,
          note: addedNote.note,
          last_edited: addedNote.last_edited,
          tags: addedNote.tags,
        }),
      }
    );
    if (res.ok) {
      res = await res.json();
      console.log(res);
      onUpdateNote({
        ...addedNote,
        server_id: res["id"],
      });
    } else {
      console.log("Error in adding note");
    }
  };

  const getActiveNote = () => {
    return notes.find((note) => note.client_id === activeNote);
  };

  const deleteNote = async () => {
    const deletedNote = getActiveNote();
    setActiveNote(null);
    setNotes(notes.filter((note) => note.client_id !== deletedNote.client_id));
    if (!deletedNote.server_id) return;
    let res = await fetch(
      process.env.REACT_APP_API_URL +
        "/users/" +
        user.id +
        "/notes/" +
        deletedNote.server_id,
      {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        method: "DELETE",
      }
    );
    if (!res.ok) {
      console.log("Error while deleting note");
    }
  };

  const newNote = () => {
    var m = new Date();
    var dateString =
      m.getUTCFullYear() +
      "-" +
      (m.getUTCMonth() + 1) +
      "-" +
      m.getUTCDate() +
      " " +
      m.getUTCHours() +
      ":" +
      m.getUTCMinutes() +
      ":" +
      m.getUTCSeconds();
    const note = {
      client_id: uuid(),
      user_id: user.id,
      title: "",
      note: "",
      last_edited: dateString,
    };
    setActiveNote(note.client_id);
    setNotes([note, ...notes]);
  };

  useEffect(() => {
    (async () => {
      let res = await fetch(process.env.REACT_APP_API_URL + "/users/verify", {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      if (res.ok) {
        res = await res.json();
        setUser(res);
        res = await fetch(
          process.env.REACT_APP_API_URL + "/users/" + res.id + "/notes",
          {
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );
        if (res.ok) {
          res = await res.json();
          res.map((obj) => {
            notes.push({
              server_id: obj[0],
              client_id: uuid(),
              user_id: obj[1],
              title: obj[2],
              note: obj[3],
              last_edited: obj[4],
              tags: obj[5],
            });
          });
        } else {
          setNotes([]);
        }
      } else {
        setUser(null);
      }
      setLoading(true);
    })();
  }, []);

  return (
    <div>
      <BrowserRouter>
        {loading ? (
          <>
            <Navbar user={user} handleLogOut={handleLogOut} />
            {user ? (
              <div className="d-flex" id="wrapper">
                <Sidebar
                  notes={notes}
                  activeNote={getActiveNote()}
                  setActiveNote={setActiveNote}
                  updateNote={updateNote}
                  addNote={addNote}
                  className="left"
                />
                <Notes
                  activeNote={getActiveNote()}
                  setActiveNote={setActiveNote}
                  onUpdateNote={onUpdateNote}
                  updateNote={updateNote}
                  addNote={addNote}
                  newNote={newNote}
                  deleteNote={deleteNote}
                />
              </div>
            ) : (
              <Home notes={notes} setUser={makeUser} />
            )}
          </>
        ) : (
          <div className="container text-center mt-5">
            <BeatLoader loading />
          </div>
        )}
      </BrowserRouter>
    </div>
  );
}

export default App;
