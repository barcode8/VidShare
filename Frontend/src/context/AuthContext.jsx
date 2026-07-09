import {createContext ,useContext, useState, useEffect } from "react";
import axios from "axios";

/*
AuthContext:
- Holds current user state
- On app load, checks existing session via cookie
- Exposes login/logout helpers for the rest of the app
*/

//Creates context named AuthContext, this AuthContext stores every state and method we create in it, any component which accesses AuthContext will have access to all its states and methods
const AuthContext = createContext(null)

//This is the "broascaster" of the context, we wrap the main router provider with this
export const AuthProvider = ({children}) =>{
    //This stores the main user info like full name, avatar etc
    const [user, setUser] = useState(null);

    //This is used to store the state so we can check if user data is available or not while we diplay a loading bar on the frontend
    const [loading, setLoading] = useState(true);

    //This allows us to run a block of code when any element within the dependency array is changed, in this case it will only run once
    useEffect(()=>{

        //This method calls the current user API from the backend to obtain current user info
        const checkAuth = async ()=>{
            try{
                const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/v1/users/current-user`, {
                    withCredentials: true //Not using will cause the request to exclude the cookie, which the backend will then reject because of CORS
                });
                setUser(res.data.data) //User data is added to the user variable

            }catch(error){
                setUser(null) //If the API sends an error, we set the user to NULL to avoid any misleading on the frontend
            }finally{
                setLoading(false) //Regardless of the outcome, we want the loading animation to stop so the user can see whether they are logged in or not
            }
        }
        checkAuth() //Executing the checkAuth method
    },[])

    //This is an arrow function and it is called in useLoginController.js to store the user data that we obtained from the login API call into the context
    const login = (userData) => setUser(userData)

    //This functions lets us logout of our current user by directly calling the logout API and setting the user data to NULL
    const logout = async () => {
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/v1/users/logout`, {}, { withCredentials: true });
        setUser(null);
    };

    return(
        //Here we are defining everything that every component will have access to
        <AuthContext.Provider value={{user, login, logout, loading}}>
            {children}
        </AuthContext.Provider>
    )
}

//We create this method so we dont have to do the
//1. import AuthContext
//2. useContext(AuthContext)
//3. Then requesting the states and data we need
//With this method, we can skip everything which reduces redundancy
export const useAuth = () => useContext(AuthContext)