"use client";

import React, { useState, useEffect, useRef } from "react";
import "./style.css";

/**
 * This is the landing page component
 */
function Home() {
  // state to record the which video is currently on the screen
  const [scrolledToVideoNumber, setScrolledToVideoNumber] = useState<number>(1);

  const containerRef = useRef<HTMLDivElement | null>(null); // This is ref to the wrapper of everything

  // page = 1 is the landing page, page = 2 is the nav menu
  const [pageNum, setPageNum] = useState<number>(1);

  const [bgGradient, setBgGradient] = useState<string>(
    "from-[#000814] via-[#000814] to-[#001D3D]"
  );
  // This is index of the element at the center of the carousel
  const [activeIndex, setActiveIndex] = useState(0);
  const updateIndex = (newIndex: number) => {
    if (newIndex < 0) {
      newIndex = 4;
    } else if (newIndex >= 3) {
      newIndex = 0;
    }
    setActiveIndex(newIndex);
  };

  // This will be used to render carousel
  const testimonials = [
    <div>
      <p className="text-2xl whitespace-normal text-white text-center">
        “I love that our students are getting introduced to AI. I think these
        skills are important for the future.”
      </p>
      <p className="absolute right-10 bottom-10 text-2xl whitespace-normal text-white text-right">
        - Principal Holmes
      </p>
    </div>,
    <div>
      <p className="text-2xl whitespace-normal text-white text-center">
        “The kids love it, and I was really surprised I was able to set it up
        myself. I've been teaching for 40 years, and new technology has never
        been easy to use. This was quite easy.”
      </p>
      <p className="absolute right-10 bottom-10 text-2xl whitespace-normal text-white text-right">
        - Mrs. Deters
      </p>
    </div>,
    <div>
      <p className="text-2xl whitespace-normal text-white text-center">
        “My Students have enjoyed creating their own stories, covering weeks of
        lessons in a single class, and sharing their stories with their
        friends.”
      </p>
      <p className="absolute right-10 bottom-10 text-2xl whitespace-normal text-white text-right">
        - Mrs Tierney
      </p>
    </div>,
    <div>
      <p className="text-2xl whitespace-normal text-white text-center">
        “Look at my story about the Egg man!”
      </p>
      <p className="absolute right-10 bottom-10 text-2xl whitespace-normal text-white text-right">
        - Braiden
      </p>
    </div>,
    <div>
      <p className="text-2xl whitespace-normal text-white text-center">
        “I love it. One of my favorites.”
      </p>
      <p className="absolute right-10 bottom-10 text-2xl whitespace-normal text-white text-right">
        - Zion
      </p>
    </div>,
  ];

  // update the video number based on scroll height
  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const handleScroll = () => {
      if (containerRef.current) {
        console.log(containerRef.current.scrollTop);
        if (containerRef.current.scrollTop >= 3 * window.innerHeight) {
          setScrolledToVideoNumber(3);
        } else if (containerRef.current.scrollTop >= 1.8 * window.innerHeight) {
          setScrolledToVideoNumber(2);
        } else if (containerRef.current.scrollTop >= 0.2 * window.innerHeight) {
          setScrolledToVideoNumber(1);
        } else {
          setScrolledToVideoNumber(-1);
        }
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // rotate the carousel every 5 seconds
  useEffect(() => {
    let timer = setTimeout(() => {
      updateIndex(activeIndex + 1);
    }, 5000);

    return () => clearTimeout(timer);
  }, [activeIndex]);

  // change background based on page number, landing page is blue, menu page is yellow
  useEffect(() => {
    if (pageNum === 1) {
      setBgGradient("from-[#000814] via-[#000814] to-[#001D3D]");
    } else if (pageNum === 2) {
      setBgGradient("from-[#FFC300] via-[#FFD60A] to-[#FFC300]");
    } else if (pageNum === 3) {
      setBgGradient("from-[#000814] via-[#000814] to-[#001D3D]");
    }
  }, [pageNum]);

  return (
    <>
      <div
        className={`landing-page w-screen h-screen overflow-hidden overflow-y-scroll bg-gradient-to-tr ${bgGradient} duration-500 ${
          pageNum === 1 ? "text-[#E9F8FE]" : "text-[#000814]"
        }`}
        ref={containerRef}
      >
        <header className="absolute z-[99] top-0 left-0 fade-in flex items-center justify-between h-[10vh] w-full px-6 py-6 text-2xl font-normal">
          <a
            className="flex items-center"
            href="/"
            onClick={() => {
              setPageNum(0);
            }}
          >
            <img
              src="/logo/logo-dark.svg"
              alt="Logo"
              className="w-12 h-12 rounded"
            />
            <div className="ml-5">Geni</div>
          </a>
          <div className="flex items-center">
            <a
              id="research"
              href="#research"
              className="app-nav flex items-center mr-5"
              onClick={() => {
                setPageNum(2);
              }}
              onMouseOver={() => {}}
            >
              Research
            </a>
            <a
              id="login"
              href="/login"
              className="flex items-center rounded h-12 px-4 mr-5 text-[#000814] bg-[#FFD60A] hover:rounded-3xl hover:shadow-lg shadow-[#FFD60A] hover:scale-105"
            >
              Log in
            </a>
          </div>
        </header>

        {/* Home Page */}
        <section className={`home ${pageNum === 1 ? "active" : "hidden"}`}>
          <section className="w-screen h-screen flex justify-center items-center">
            <div className="fade-in flex justify-center items-center flex-col h-screen">
              <div className="text-center mt-10">
                <h2 className="text-8xl tracking-[-0.040em] font-normal">
                  Personalized Education
                </h2>
                <p className="text-lg tracking-wide mt-6">
                  powered by the latest AI research
                </p>
                <p className="text-lg tracking-wide mt-[1px]">
                  developed by UIUC CS
                </p>
              </div>
              <div className="text-lg tracking-wide mt-6">
                Check out our personalized writing assignment
              </div>
              <a className="mt-[1px]" href="/demo">
                <button className="rounded text-[#000814] h-12 px-4 text-2xl mt-[1px] bg-[#FFD60A] hover:rounded-3xl hover:shadow-lg shadow-[#FFD60A] hover:scale-105">
                  Demo
                </button>
              </a>
              <div className="flex justify-between mt-6 items-center w-full">
                <a
                  className="cursor-pointer"
                  href="https://opensourceatillinois.com/"
                  target="_blank"
                >
                  <img
                    className="w-32 inline-block mr-5"
                    src="/images/partners/open-source.png"
                    alt=""
                  />
                </a>
                <a
                  className="cursor-pointer"
                  href="https://acourageoushope.org/"
                  target="_blank"
                >
                  <img
                    className="w-72 inline-block mr-5"
                    src="/images/partners/courageous-hope.png"
                    alt=""
                  />
                </a>
                <a
                  className="cursor-pointer"
                  href="https://www.facesconsulting.com/"
                  target="_blank"
                >
                  <img
                    className="w-40 inline-block"
                    src="/images/partners/faces.png"
                    alt=""
                  />
                </a>
              </div>
            </div>
          </section>

          {/* Feature section */}
          <section className="h-[300vh] flex justify-between items-start px-8 mt-[20vh]">
            {/* Left column of feature section */}
            <div className="left h-[300vh]">
              <div className="w-[36vw] sticky top-[30vh] left-0">
                <p className="text-xl text-[hsla(0,0%,100%,.6)]">
                  Geni features
                </p>
                {scrolledToVideoNumber === 1 && (
                  <div className="fade-in">
                    <h1 className="text-5xl text-white py-8">
                      Seamless integration with Google Classroom
                    </h1>
                    <p className="text-xl text-[hsla(0,0%,100%,.6)]">
                      Simplified transition for you and your students: Our
                      integration with Google Classroom makes it easy to get
                      started with our AI-powered learning tools. Students don't
                      have to learn a new app, they can see everything they need
                      in Google Classroom.
                    </p>
                  </div>
                )}
                {scrolledToVideoNumber === 2 && (
                  <div className="fade-in">
                    <h1 className="text-5xl text-white py-8">
                      Custom Assignments combining both fun and learning
                    </h1>
                    <p className="text-xl text-[hsla(0,0%,100%,.6)]">
                      Have custom assignments based off of your daily lesson
                      plan done in just a few minutes. Fun, engaging, and fully
                      customizable with the power of AI to speed up your
                      workflow and keep kids hooked.
                    </p>
                  </div>
                )}
                {scrolledToVideoNumber === 3 && (
                  <div className="fade-in">
                    <h1 className="text-5xl text-white py-8">
                      A writing companion to transform a child into an amateur
                      author
                    </h1>
                    <p className="text-xl text-[hsla(0,0%,100%,.6)]">
                      Imagine a companion that could help a kid develop his/her
                      writing skills no matter what stage they’re in. This
                      product is now possible. It will help a student
                      progressively improve writing skills from 0 to master
                      through having him/her create storybooks, poems, and
                      essays.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right column of feature section */}
            <div className="right h-[300vh] flex flex-col items-end justify-between">
              <div className="w-[56vw] rounded-xl overflow-hidden">
                <video
                  loop
                  muted
                  playsInline
                  autoPlay
                  className="inset-0 h-full w-full object-contain"
                >
                  <source
                    src="/feature_videos/google_classroom.mp4"
                    type="video/mp4"
                  />
                </video>
              </div>

              <div className="w-[56vw] rounded-xl overflow-hidden">
                <video
                  loop
                  muted
                  playsInline
                  autoPlay
                  className="h-full w-full object-contain"
                >
                  <source
                    src="/feature_videos/storybook.mp4"
                    type="video/mp4"
                  />
                </video>
              </div>

              <div className="w-[56vw] rounded-xl overflow-hidden">
                <video
                  loop
                  muted
                  playsInline
                  autoPlay
                  className="h-full w-full object-contain"
                >
                  <source
                    src="/feature_videos/writing_companion.mp4"
                    type="video/mp4"
                  />
                </video>
              </div>
            </div>
          </section>

          {/* Carousel of Testimonial */}
          <section className="testimony w-screen flex justify-center items-center mt-[50vh] mb-[10vh]">
            <div>
              <div className="carousel w-[81vw] flex flex-col justify-center">
                <div className="overflow-hidden">
                  <div
                    className="w-[135vw] h-[70vh] flex whitespace-nowrap transition-all duration-300"
                    style={{ transform: `translate(-${activeIndex * 27}vw)` }}
                  >
                    {testimonials.map((item, index) => {
                      return (
                        <React.Fragment key={`carousel-item-${index}`}>
                          <div className="w-[27vw] h-[70vh] flex">
                            <div className="w-[25vw] rounded-xl p-10 bg-[#001D3D] pl-10 pr-10 relative">
                              {item}
                            </div>
                          </div>
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </section>

        {/* Menu page */}
        <section
          className={`research ${pageNum === 2 ? "active" : "hidden"} w-full`}
        >
          <div className="fade-in flex justify-center items-center flex-col h-[80vh] w-full">
            <div className="group flex justify-center items-left flex-col w-[95vh] border-b-4 mb-10 border-[#000000]">
              <div className="each-group flex justify-between items-bottom w-[95vh]">
                <h3 className="name flex w-[30vh] text-5xl tracking-[-0.020em] font-bold">
                  ASCEND
                </h3>
                <div className="description flex items-end ml-5 text-lg grow w-[65vh] font-normal">
                  The Autonomous AI research that is the backbone of Geni
                </div>
              </div>
            </div>
            <div className="group flex justify-center items-left flex-col w-[95vh] border-b-4 mb-10 border-[#000000]">
              <div className="each-group flex justify-between items-bottom w-[95vh]">
                <h3 className="name flex w-[30vh] text-5xl tracking-[-0.020em] font-bold">
                  ESTUS
                </h3>
                <div className="description flex items-end ml-5 text-lg grow w-[65vh] font-normal">
                  Information Extraction research that gives Geni the factual
                  accuracy{" "}
                </div>
              </div>
            </div>
            <div className="group flex justify-center items-left flex-col w-[95vh] border-b-4 mb-10 border-[#000000]">
              <div className="each-group flex justify-between items-bottom w-[95vh]">
                <h3 className="name flex w-[30vh] text-5xl tracking-[-0.020em] font-bold">
                  SPARKLE
                </h3>
                <div className="description flex items-end ml-5 text-lg grow w-[65vh] font-normal">
                  AI Decision research that helps Geni become the perfect
                  assistant for teachers and studnets
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export default Home;

