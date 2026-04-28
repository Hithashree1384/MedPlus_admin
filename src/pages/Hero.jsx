import React from 'react'
import Navbar from '../components/Navbar'
import { heroStyles } from '../assets/dummyStyles'
import logo from "../assets/logo.jpeg"

const Hero = ({role="admin" ,username="Doctor"}) => {
  const isDoctor= role === "doctor";


  return (
    <div  className={heroStyles.container}>
      <Navbar/>
      <main className={heroStyles.mainContainer}>
        <section className={heroStyles.section}>
          <div className={heroStyles.decorativeBg.container}>
            <div className={heroStyles.decorativeBg.blurBackground}>
              <div className={heroStyles.decorativeBg.blurShape}></div>
              </div>
                <div className={heroStyles.contentBox}>
                  <div className={heroStyles.logoContainer}>
                    <img src={logo} alt="Logo" className={heroStyles.logo} />
                  </div>
                  <h1 className={heroStyles.heading}>
                    {isDoctor ? `Welcome, Dr. ${username}` :"Welcome to MedPlus Admin Panel"}
                  </h1>
                  <p className={heroStyles.description}>
                    {isDoctor ? "Access your patient records, manage appointments, and review medical reports securely from your dashboard."
 : "Manage hospital operations, doctors, staff, patient records, and system settings from a centralized control panel."}
                  </p>

                  <div className={heroStyles.infoCards.container}>
                    <div className={heroStyles.infoCards.card}>
                      <h3 className={heroStyles.infoCards.cardTitle}>Secure Access</h3>
                      <p className={heroStyles.infoCards.cardText}>
                        Your data is protected with security measures, ensuring confidentiality and peace of mind.
                      </p>
                    </div>

                      <div className={heroStyles.infoCards.card}>
                      <h3 className={heroStyles.infoCards.cardTitle}>Real time Updates</h3>
                      <p className={heroStyles.infoCards.cardText}>
                        Stay informed with real-time updates on patient status, appointments, and system notifications.
                      </p>
                    </div>
                                        <div className={heroStyles.infoCards.card}>
                      <h3 className={heroStyles.infoCards.cardTitle}>Comprehensive Reporting</h3>
                      <p className={heroStyles.infoCards.cardText}>
                        Generate detailed reports and analytics to make informed decisions about your practice.
                      </p>
                    </div>
                  </div>
                </div>
             
            
          </div>
        </section>

      </main>
    </div>
  )
}

export default Hero
