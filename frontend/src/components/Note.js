import React, { useState, useEffect } from "react";
import { FiPlusCircle } from "react-icons/fi";
import { Input, Label, Button } from "reactstrap";
import { RiDeleteBin6Line } from "react-icons/ri";
import CreatableSelect from "react-select/creatable";

const Note = ({
  activeNote,
  setActiveNote,
  onUpdateNote,
  updateNote,
  addNote,
  newNote,
  deleteNote,
}) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const format = (date) => {
    return (
      ("00" + date.getDate()).slice(-2) +
      " " +
      date.toLocaleString("default", { month: "short" }) +
      " " +
      date.getFullYear() +
      " " +
      ("00" + date.getHours()).slice(-2) +
      ":" +
      ("00" + date.getMinutes()).slice(-2)
    );
  };
  const handleSave = () => {
    if (activeNote.server_id) updateNote(activeNote);
    else addNote(activeNote);
    setActiveNote("");
  };

  const onEditField = (field, value) => {
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
    onUpdateNote({
      ...activeNote,
      [field]: value,
      last_edited: dateString,
    });
  };

  const [selectedOptions, setSelectedOptions] = useState([]);

  const handleChange = (options) => {
    setSelectedOptions(options);
    // console.log(options.map(o => o['label']))
    if (options)
      onEditField(
        "tags",
        options.map((sel) => sel["label"])
      );
  };
  useEffect(() => {
    setLoading(false);
    setSelectedOptions([]);
    setOptions([]);
    let op = [];
    if (activeNote && activeNote.tags) {
      activeNote.tags.map((tag) => {
        op.push({
          value: tag,
          label: tag,
        });
      });
    }
    setSelectedOptions(op);
    setOptions(op);
    setLoading(true);
  }, [activeNote]);

  return activeNote ? (
    loading && (
      <div id="page-content-wrapper">
        <div className="container-fluid">
          <Input
            type="text"
            autoFocus
            className="mt-3"
            placeholder="Title"
            value={activeNote.title}
            onChange={(e) => onEditField("title", e.target.value)}
          />
          <Label className="mt-3 mb-1">HASHTAGS</Label>
          <CreatableSelect
            closeMenuOnSelect={false}
            isMulti
            value={selectedOptions}
            placeholder="Type hashtags without #"
            // options={options}
            // noOptionsMessage={() => null}
            onChange={handleChange}
            // onInputChange={handleInputChange}
          />

          <Input
            type="textarea"
            className="mt-3"
            rows="10"
            placeholder="Body"
            value={activeNote.note}
            onChange={(e) => onEditField("note", e.target.value)}
          />
          <div className="d-flex mt-3  justify-content-between">
            <small>
              {activeNote.last_edited &&
                "Last Edited: " +
                  format(new Date(activeNote.last_edited + " UTC"))}
            </small>
            <div>
              <Button
                className={
                  activeNote.server_id
                    ? "btn btn-danger me-3"
                    : "btn btn-danger me-3 disabled"
                }
                onClick={() => deleteNote()}
              >
                <RiDeleteBin6Line color="white" size="20" />
              </Button>
              <Button className="btn btn-primary" onClick={handleSave}>
                Save & Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  ) : (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{ width: "100%" }}
    >
      <FiPlusCircle size={"150"} onClick={newNote} />
    </div>
  );
};

export default Note;
