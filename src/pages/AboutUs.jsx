import { Helmet } from "react-helmet-async";
import "../styles/AboutUs.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Autoplay } from "swiper/modules";
import React, { useState } from "react";
import "swiper/css";
import "swiper/css/effect-coverflow";
const TEAM = [
  {
    name: "Vamshidar Reddy",
    role: "Co-Founder",
    image:
      "https://static.wixstatic.com/media/8d617c_d5af19944ebd4084a06c537b648ab1d7~mv2.png/v1/crop/x_0%2Cy_0%2Cw_1024%2Ch_849/fill/w_806%2Ch_668%2Cal_c%2Cq_92%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/Gemini_Generated_Image_i6pvcgi6pvcgi6pv.png",
    imagePosition: "50% 18%",
    bio:
      "Drives innovation in tech education, empowering students to explore and excel in the evolving world of technology.",
  },
  {
    name: "Anvesh Reddy",
    role: "CEO",
    image:
      "https://static.wixstatic.com/media/8d617c_f1066df64f3947f09ce362eb2d760371~mv2.png/v1/crop/x_0%2Cy_0%2Cw_625%2Ch_518/fill/w_806%2Ch_668%2Cal_c%2Cq_92%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/Capture_PNG.png",
    imagePosition: "50% 16%",
    bio:
      "Leads innovation in IoT and IoE with expertise in robotics, embedded systems, and Python.",
  },
  {
    name: "Apurupa Laxmi",
    role: "Marketing Director",
    image:
      "https://static.wixstatic.com/media/8d617c_bc7ca3e783da43ddb1c5891a0703d330~mv2.png/v1/crop/x_0%2Cy_182%2Cw_832%2Ch_689/fill/w_806%2Ch_668%2Cal_c%2Cq_92%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/Generated%20Image%20October%2024%2C%202025%20-%204_02PM.png",
    imagePosition: "50% 18%",
    bio:
      "Leads strategic marketing initiatives with expertise in brand growth, digital campaigns, and data-driven decisions.",
  },
];

const CLIENT_IMAGES = [
  "/images/aboutus/6713791d-e668-46c6-9bfd-522aa097be0a.JPG",
  "/images/aboutus/c63a85d7-d797-41cf-9044-2c6a9e13fb96.jpg",
  "/images/aboutus/whatsapp.jpeg",
  "/images/aboutus/IMG_4225 (1).jpg",
  "/images/aboutus/IMG_8481.jpg",
];

export default function AboutUs() {
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
          <blockquote>
            We have partnered with Arc Labs for multiple projects, and their custom development
            boards have exceeded our expectations. Their attention to detail, prompt communication,
            and high-quality products have made them a trusted partner for our technology needs.
          </blockquote>
          <figcaption>Krishna Murthy, GCET</figcaption>
        </figure>

<div className="about-gallery">

<Swiper
  effect="coverflow"
  centeredSlides={true}
  slidesPerView="auto"
  loop={true}
  speed={950}

autoplay={{
  delay: 2500,
  disableOnInteraction: false,
}}

  coverflowEffect={{
    rotate: 0,
    stretch: -26,
    depth: 280,
    modifier: 1.35,
    scale: 0.82,
    slideShadows: false,
  }}

  modules={[EffectCoverflow, Autoplay]}
  className="aboutSwiper"
>
    {CLIENT_IMAGES.map((image, index) => (
<SwiperSlide key={index}>
  <img
    src={image}
    alt={`Gallery ${index + 1}`}
  />
</SwiperSlide>
    ))}
  </Swiper>

</div>
      </section>

      <section className="about-newsletter">
        <div>
          <div className="section-label">Stay Connected</div>
          <h2>Be the first to find out about the newest programs, workshops, and community activities.</h2>
        </div>
        <form className="about-newsletter-form">
          <label htmlFor="about-email">Email*</label>
          <div>
            <input id="about-email" type="email" placeholder="hello@example.com" />
            <button type="submit">Join</button>
          </div>
        </form>
      </section>
    </>
  );
}
