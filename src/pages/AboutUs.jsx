import { Helmet } from "react-helmet-async";
import "../styles/AboutUs.css";
import "../styles/AboutUsGalleryFinal.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Autoplay } from "swiper/modules";
import React, { useState } from "react";
import "swiper/css";
import "swiper/css/effect-coverflow";
const TEAM = [
  {
    name: "Vamshidar Reddy",
    role: "Co-Founder & CMO",
    image:
      "https://static.wixstatic.com/media/8d617c_591d308abb6443ba8cf3bafcaba91563~mv2.png",
    imagePosition: "50% 18%",
    bio:
      "Drives innovation in tech education, empowering students to explore and excel in the evolving world of technology.",
  },
  {
    name: "Anvesh Reddy",
    role: "Founder & CEO",
    image:
      "https://static.wixstatic.com/media/8d617c_bac64c9a58404aeb8a59eeb554137d4c~mv2.png",
    imagePosition: "50% 16%",
    bio:
      "Leads innovation in IoT and IoE with expertise in robotics, embedded systems, and Python.",
  },
  {
    name: "Apurupa Laxmi",
    role: "Co-Founder & COO",
    image:
      "https://static.wixstatic.com/media/8d617c_8e21b92b440b40ee8303122247c58701~mv2.png",
    imagePosition: "50% 18%",
    bio:
      "Leads strategic marketing initiatives with expertise in brand growth, digital campaigns, and data-driven decisions.",
  },
];

const CLIENTS = [
  { file: "ACE Engineering College.JPEG", institution: "ACE Engineering College", location: "Hyderabad", workshop: "Technology Workshop" },
  { file: "CMRIT Hyderabad.jpg", institution: "CMRIT", location: "Hyderabad", workshop: "Technology Workshop" },
  { file: "D Y PTatil University, Maharashtara-IoRT.jpeg", institution: "D Y Patil University", location: "Maharashtra", workshop: "IoRT Workshop" },
  { file: "Delhi Public School, Hyd-IoRT.jpeg", institution: "Delhi Public School", location: "Hyderabad", workshop: "IoRT Workshop" },
  { file: "Don Bosco college of Engineering, Goa.JPG", institution: "Don Bosco College of Engineering", location: "Goa", workshop: "Technology Workshop" },
  { file: "IIT HYD, Drone.JPG", institution: "IIT Hyderabad", location: "Hyderabad", workshop: "Drone Workshop" },
  { file: "Janetics Coimbatoor.jpeg", institution: "Janatics", location: "Coimbatore", workshop: "Technology Workshop" },
  { file: "JNTUH-IoRT, Hyd.jpg", institution: "JNTUH", location: "Hyderabad", workshop: "IoRT Workshop" },
  { file: "Karnatka Arts,Science and Commerce College, Bidar.jpg", institution: "Karnataka Arts, Science and Commerce College", location: "Bidar", workshop: "Technology Workshop" },
  { file: "KITE College, Banglore(IoT).jpg", institution: "KITE College", location: "Bangalore", workshop: "IoT Workshop" },
  { file: "LIttle Learning Foundation, New Dehli - IoT Corparate Training.png", institution: "Little Learning Foundation", location: "New Delhi", workshop: "IoT Corporate Training" },
  { file: "Loyola Eng College, Chennai-Iot.jpg", institution: "Loyola Engineering College", location: "Chennai", workshop: "IoT Workshop" },
  { file: "Mallareddy University, Hyd-Advanced IoT.JPG", institution: "Malla Reddy University", location: "Hyderabad", workshop: "Advanced IoT Workshop" },
  { file: "MGM's Eng College, Nanded-IoT.jpg", institution: "MGM's Engineering College", location: "Nanded", workshop: "IoT Workshop" },
  { file: "MIT Pune-ToRT.JPG", institution: "MIT Pune", location: "Pune", workshop: "IoRT Workshop" },
  { file: "Mohan Babu University, Tirupathi-Advanced IoT.jpg", institution: "Mohan Babu University", location: "Tirupati", workshop: "Advanced IoT Workshop" },
  { file: "Mumbai-FCRIT.jpg", institution: "FCRIT", location: "Mumbai", workshop: "Technology Workshop" },
  { file: "Okridge International School, Gachibowli, Hyd-Robottics.jpeg", institution: "Oakridge International School", location: "Gachibowli, Hyderabad", workshop: "Robotics Workshop" },
  { file: "Reva University, Banglore-IoT.JPEG", institution: "Reva University", location: "Bangalore", workshop: "IoT Workshop" },
  { file: "RTA 2.jpg", institution: "RTA", location: "Hyderabad", workshop: "Technology Workshop" },
  { file: "RTA.jpg", institution: "RTA", location: "Hyderabad", workshop: "Technology Workshop" },
  { file: "Sai Ram College of Eng, Banglore-IoT.jpg", institution: "Sai Ram College of Engineering", location: "Bangalore", workshop: "IoT Workshop" },
  { file: "SIC(Samsung Ino Center.JPG", institution: "Samsung Innovation Center", location: "Hyderabad", workshop: "Innovation Workshop" },
  { file: "SRM University, kattankulathur, Tamil Nadu - IoT with RPI.JPG", institution: "SRM University", location: "Kattankulathur, Tamil Nadu", workshop: "IoT with Raspberry Pi Workshop" },
  { file: "Swarnandra Eng College, Andra Pradesh-Embedded Internship.jpg", institution: "Swarnandhra Engineering College", location: "Andhra Pradesh", workshop: "Embedded Internship" },
  { file: "VIT, Chennai-IoT.jpg", institution: "VIT", location: "Chennai", workshop: "IoT Workshop" },
].map((client) => ({
  ...client,
  image: `/images/aboutus/${client.file}`,
  caption: `${client.institution}, ${client.location} - ${client.workshop}`,
  description: `Arc Labs partnered with ${client.institution} for a hands-on ${client.workshop.toLowerCase()} in ${client.location}. The session focused on practical learning, guided implementation, and industry-ready project exposure for participants.`,
}));



export default function AboutUs() {
  const [activeClientIndex, setActiveClientIndex] = useState(0);
  const activeClient = CLIENTS[activeClientIndex] || CLIENTS[0];

  return (
    <>
      <Helmet>
        <title>About Us | ARC LABS</title>
        <meta
          name="description"
          content="Arc Labs is a technology training provider with over 10 years of experience in IoT, Robotics, AI, Embedded Systems, Cloud Computing, and Coding."
        />
        <link rel="canonical" href="https://arclabs.in/about-us" />
      </Helmet>

      <section className="about-hero">
        <div className="about-hero-inner">
          <div className="section-label">About Us</div>
          <h1>Our Story</h1>
          <p className="about-kicker">A journey of passion, purpose, and innovation</p>
          <p className="about-story">
            Arc Labs is a leading technology training provider with over 10 years of experience,
            registered under the Ministry of MSME. We bridge the gap between classroom learning
            and real-world application through hands-on, project-based training in IoT, Robotics,
            AI, Embedded Systems, Cloud Computing, and Coding. Trusted by 1,000+ institutions and
            organizations, Arc Labs has empowered over 25,000 learners with 3,000+ impactful
            trainings-driving innovation, skill development, and career growth.
          </p>
        </div>
      </section>

      <section className="about-section about-team">
        <div className="about-section-head">
          <div className="section-label">Meet the Team</div>
          <h2>Experts united by creativity, technology, and a vision for the future.</h2>
        </div>

        <div className="about-team-grid">
          {TEAM.map((member) => (
            <article className="about-team-card" key={member.name}>
              <div className="about-team-image">
                <img
                  src={member.image}
                  alt={member.name}
                  loading="lazy"
                  style={{ objectPosition: member.imagePosition }}
                />
              </div>
              <div className="about-team-body">
                <p className="about-team-role">{member.role}</p>
                <h3>{member.name}</h3>
                <p>{member.bio}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="about-section about-clients">
        <div className="about-section-head">
          <div className="section-label">Our Happy Clients</div>
          <h2>Trusted by institutions and partners.</h2>
        </div>

        <figure className="about-quote">
          <div className="about-quote-copy" key={activeClient.file} aria-live="polite">
            <blockquote>{activeClient.description}</blockquote>
            <figcaption>{activeClient.caption}</figcaption>
          </div>
        </figure>

<div className="about-gallery">

<Swiper
  effect="coverflow"
  centeredSlides={true}
  slidesPerView="auto"
  loop={true}
  speed={950}
  onSlideChange={(swiper) => setActiveClientIndex(swiper.realIndex)}

autoplay={{
  delay: 2500,
  disableOnInteraction: false,
}}

  coverflowEffect={{
    rotate: 0,
    stretch: -54,
    depth: 220,
    modifier: 1.15,
    scale: 0.86,
    slideShadows: false,
  }}

  modules={[EffectCoverflow, Autoplay]}
  className="aboutSwiper"
>
    {CLIENTS.map((client) => (
<SwiperSlide key={client.file}>
  <img
    src={client.image}
    alt={`${client.institution} ${client.workshop}`}
  />
</SwiperSlide>
    ))}
  </Swiper>

</div>
      </section>

    </>
  );
}
