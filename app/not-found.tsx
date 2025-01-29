/* eslint-disable prettier/prettier */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable prettier/prettier */
"use client";

import Link from "next/link";

const NotFound = () => {
  return (
    <div>
      <div className="bg-white min-h-screen lg:px-24 lg:py-24 md:py-20 md:px-44 px-4 py-24 items-center flex justify-center flex-col-reverse lg:flex-row md:gap-28 gap-16">
        <div className="xl:pt-24 w-full xl:w-1/2 relative pb-12 lg:pb-0">
          <div className="relative">
            <div className="absolute">
              <div className="">
                <h1 className="my-2 text-gray-800 font-bold text-2xl">
                Looks like you've stumbled upon the path to the unknown. Time to turn back or discover something new!
                </h1>
                <p className="my-2 text-gray-800">
                Oops, looks like you've taken a detour! Head back to our homepage to find your way.
                </p>
                <Link href="/">
                  <button className="sm:w-full lg:w-auto my-2 border rounded md py-4 px-8 text-center bg-green-200 text-black  ">
                   Let me guide you back—click below!
                  </button>
                </Link>
              </div>
            </div>
            <div>
              <img alt="" src="https://img.freepik.com/premium-vector/oops-404-found-error-concept-vector-illustration_684242-20.jpg?ga=GA1.1.1302518135.1720608685&semt=ais_hybrid" />
            </div>
          </div>
        </div>
        <div>
          <img alt="" src="https://img.freepik.com/premium-vector/vector-illustration-about-desert-landscape-concept-with-404-error-page_675567-6056.jpg?ga=GA1.1.1302518135.1720608685&semt=ais_hybrid" />
        </div>
      </div>
    </div>
  );
};

export default NotFound;