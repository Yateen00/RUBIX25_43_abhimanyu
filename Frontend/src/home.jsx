import React from 'react';
import {useNavigate} from 'react-router-dom';
import { Globe, Calendar, User, Thermometer, Activity, BarChart } from 'lucide-react';
import 'tailwindcss/tailwind.css';

const HomePage = () => {
  const navigate = useNavigate();
  return (
    <div className="relative bg-gray-900 text-white min-h-screen font-sans overflow-auto">
      {/* Background Video */}
      <video
        className="absolute top-0 left-0 w-full h-full object-cover z-0 opacity-50"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="./src/assets/bg-video.mp4" type="video/mp4" />
      </video>

      <header className="relative text-center py-20 z-10">
        <div className="bg-black bg-opacity-70 p-8 rounded-lg inline-block">
          <h1 className="text-5xl md:text-7xl font-bold text-white animate-fade-in">
            Disease Prediction Platform
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-gray-200">
            Leveraging Time Series Analysis with Prophet FB
          </p>
        </div>
        <br />
        <button onClick={()=> navigate("/map")} className='bg-black mt-4 p-2 rounded-lg px-4 text-white font-semibold text-lg'>
          Get Started
        </button>
      </header>


      <main className="px-6 md:px-16 lg:px-32 relative z-10">
        <section className="mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-white">About Time Series Analysis</h2>
          <div className="bg-black bg-opacity-70 p-6 rounded-lg">
            <p className="text-gray-200 leading-relaxed text-lg md:text-xl">
              Time series analysis is a statistical approach that entails gathering data at consistent intervals to recognize patterns and trends. This methodology is employed for making well-informed decisions and precise forecasts by leveraging insights derived from historical data. We have used Prophet FB here due to its ability to handle complex seasonal trends and deal with missing values and outliers. It requires minimal preprocessing.
            </p>
            <p className="mt-4 text-gray-200 leading-relaxed text-lg md:text-xl">
              Airborne diseases follow seasonal patterns often seen during colder months of the year. Prophet FB helps us analyze these trends and prevent major future outbreaks. Changes in environmental conditions, such as temperature and humidity, can also be factored in, allowing for real-time updates and forecastability.
            </p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-white">Input Parameters</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              { icon: Globe, color: 'blue-500', title: 'Geographical Precision', description: 'Granular state-level identification' },
              { icon: Calendar, color: 'green-500', title: 'Temporal Tracking', description: 'Comprehensive date-based progression' },
              { icon: User, color: 'purple-500', title: 'Demographic Context', description: 'Precise population mapping' }
            ].map(({ icon: Icon, color, title, description }, index) => (
              <div key={index} className="flex items-start gap-4">
                <Icon className={`text-${color} w-8 h-8`} />
                <div className="bg-black bg-opacity-70 p-4 rounded-lg">
                  <h3 className="font-semibold text-xl text-white">{title}</h3>
                  <p className="text-gray-200">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {[
          { 
            icon: Thermometer, 
            color: 'red-500', 
            title: 'Environmental Dynamics', 
            description: 'Temperature Spectrum: Average, minimum, and maximum temperature gradients, precipitation patterns, and atmospheric humidity metrics.'
          },
          { 
            icon: Activity, 
            color: 'yellow-500', 
            title: 'Mobility and Social Interaction', 
            description: 'Movement Tracking: Retail, recreational, workplace, and residential mobility patterns, along with public space utilization.'
          },
          { 
            icon: BarChart, 
            color: 'teal-500', 
            title: 'Epidemiological Indicators', 
            description: 'Daily Transmission Metrics: New confirmed cases, mortality and recovery rates, and testing distribution.'
          }
        ].map(({ icon: Icon, color, title, description }, index) => (
          <section key={index} className="mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold mb-4 text-white">{title}</h2>
            <div className="flex items-start gap-4">
              <Icon className={`text-${color} w-8 h-8`} />
              <div className="bg-black bg-opacity-70 p-4 rounded-lg">
                <p className="text-lg md:text-xl text-gray-200">{description}</p>
              </div>
            </div>
          </section>
        ))}
      </main>
    </div>
  );
};

export default HomePage;