import React, { useState, useEffect} from "react";

//This js file handles the profile page for any user

const Profile = ({user}) => {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    useEffect(() => {
        setLoading(true);
        if (!user || user.role == "admin") {
          navigate("/");
          return;
        }
        (async () => {
            let res = await fetch(
              process.env.REACT_APP_API_URL +
                "/users/profile/" +
                user.reg_no,
              {
                headers: { "Content-Type": "application/json" },
                method: "GET",
                credentials: "include",
              }
            );
            if(res.ok) {
                res = await res.json();
                console.log(res)
            }
    //const [details,setDetails] = useState("")
