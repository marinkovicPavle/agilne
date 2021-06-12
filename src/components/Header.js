import React, {Component} from 'react'
import {Link} from 'react-router-dom'
import { useAuth } from "../contexts/AuthContext"

export default function Header() {
    const { currentUser, logout } = useAuth();

      return(
          <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <Link className="navbar-brand" to={'/'}>
              <img src="/logo.png" width="30" height="30" className="d-inline-block align-top" alt="Logo"/>
                &nbsp; CRUD
            </Link>
            <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
              <span className="navbar-toggler-icon"></span>
            </button>
            {!currentUser ?
                <Link className="navbar-brand" to={'/login'}>
                    <button className="btn btn-primary">Login</button>
                </Link>
                :
                <Link className="navbar-brand" to={'/profile'}>
                    <button className="btn btn-primary">Profile</button>
                </Link>
            }
            <Link className="navbar-brand" to={'/course'}>
                    <button className="btn btn-primary">Course</button>
            </Link>
            <Link className="navbar-brand" to={'/course-type'}>
                    <button className="btn btn-primary">Course Type</button>
            </Link>
            <Link className="navbar-brand" to={'/student'}>
                    <button className="btn btn-primary">Student</button>
            </Link>
            <Link className="navbar-brand" to={'/teacher'}>
                    <button className="btn btn-primary">Teacher</button>
            </Link>
            <Link className="navbar-brand" to={'/material'}>
                    <button className="btn btn-primary">Material</button>
            </Link>
            <Link className="navbar-brand" to={'/level'}>
                    <button className="btn btn-primary">Level</button>
            </Link>
            <Link className="navbar-brand" to={'/intensity'}>
                    <button className="btn btn-primary">Intensity</button>
            </Link>
            <Link className="navbar-brand" to={'/language'}>
                    <button className="btn btn-primary">Language</button>
            </Link>
          </nav>
        )
}