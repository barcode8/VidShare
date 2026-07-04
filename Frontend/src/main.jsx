import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {createBrowserRouter, createRoutesFromElements, RouterProvider, Route} from "react-router-dom"
import Layout from './Layout.jsx'
import Home from './components/Home/Home.jsx'
import ChangePassword from './components/ChangePassword/ChangePassword.jsx'
import ChangeUserDetails from './components/ChangeUserDetails/ChangeUserDetails.jsx'
import UploadVideo from './components/UploadVideo/UploadVideo.jsx'
import './App.css'
import Login from './components/Login/Login.jsx'
import Register from './components/Register/Register.jsx'
import EditVideo from './components/EditVideo/EditVideo.jsx'
import WatchVideo from './components/WatchVideo/WatchVideo.jsx'
import UserProfile from './components/UserProfile/UserProfile.jsx'
import WatchHistory from './components/WatchHistory/WatchHistory.jsx'
import LikedVideos from './components/LikedVideos/LikedVideos.jsx'
import Subscriptions from './components/Subscriptions/Subscriptions.jsx'
import PlaylistDetail from './components/PlaylistDetail/PlaylistDetail.jsx'
import '@fontsource/roboto'; 
import { AuthProvider } from './context/AuthContext.jsx'
import SearchResult from './components/SearchResult/SearchResult.jsx'
import MyChannel from './components/MyChannel/MyChannel.jsx'
import Playlist from './components/Playlists/Playlist.jsx'

const router= createBrowserRouter(
  //Defining all the routes in this section
  createRoutesFromElements(

    //This is the absolute/home path, every path will be included in this (except 2)
      <Route path='/'>

        {/* In this what we have done is basically created a portrait, the / path is the wall (base layer), the Layout component is the picture frame and the various routes are the actual portrait  */}
        <Route element={<Layout />}>

          {/* Change password route */}
          <Route path='/change-password' element={<ChangePassword/>}/>
          <Route path='/change-details' element={<ChangeUserDetails/>}/>
          <Route path='/upload' element={<UploadVideo/>}/>
          <Route path='/channel' element={<MyChannel/>}/>
          <Route path='/edit-video/:videoId' element={<EditVideo/>}/>
          <Route path='/watch/:videoId' element={<WatchVideo/>}/>
          <Route path='/search' element={<SearchResult/>}/>
          <Route path='/channel/:username' element={<UserProfile/>}/>
          <Route path='/watch-history' element={<WatchHistory/>}/>
          <Route path='/liked-videos' element={<LikedVideos/>}/>
          <Route path='/playlists' element={<Playlist/>}/>
          <Route path='/playlists/:playlistId' element={<PlaylistDetail/>}/>
          <Route path='/subscriptions' element={<Subscriptions/>}/>
          {/* This is the home component i.e. the component that will load by default when we are at the / path */}
          <Route index element={<Home />}/>
        </Route>

      {/* Now these are the 2 exceptions, in both the /login and /register URL path we dont need the Layout aka the navbar so we define the route and what component the route will load seperately than our portrait setup */}
      <Route path='/login' element={<Login />}/>
      <Route path='/register' element={<Register />}/>
      </Route>
  )
)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Here we wrap the main core of our react project with the AuthProvider we defined in AuthContext.jsx so that every component will have access to the data and methods we defined in the context */}
    <AuthProvider>
      <RouterProvider router={router}/>
    </AuthProvider>
  </StrictMode>,
)
