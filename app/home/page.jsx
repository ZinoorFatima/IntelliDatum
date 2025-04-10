import 'bootstrap/dist/css/bootstrap.min.css';

export default function Home() {
  return (
    <div className="min-vh-100 bg-success text-white d-flex flex-column justify-content-center align-items-center px-3 px-md-5">
      
      {/* Sign In Button (Top Right) */}
      <div className="position-absolute top-0 end-0 m-3">
        <button className="btn btn-outline-light">Sign In</button>
      </div>

      {/* Main Content */}
      <div className="row w-100 align-items-center">
        
        {/* Left Section */}
        <div className="col-md-6 text-center text-md-start mb-5 mb-md-0">
          <h1 className="display-4 fw-bold">
            Smart Data <br />
            Management
          </h1>
          <p className="lead opacity-75">
            Streamline your data handling with ease.
          </p>
          <button className="btn btn-light text-success fw-semibold px-4 py-2 mt-3">
            Get Started
          </button>
        </div>

        {/* Right Section - Illustration */}
        <div className="col-md-6 d-flex justify-content-center">
          <div
            className="position-relative bg-success-subtle rounded-4 shadow-lg p-4"
            style={{ width: '300px', aspectRatio: '4 / 3' }}
          >
            {/* Decorative Circles */}
            <div className="position-absolute top-0 start-0 translate-middle bg-success p-2 rounded-circle">
              <div className="bg-success-subtle rounded-circle" style={{ width: '24px', height: '24px' }}></div>
            </div>
            <div className="position-absolute top-0 end-0 translate-middle bg-success p-2 rounded-circle">
              <div className="bg-success-subtle rounded-circle" style={{ width: '24px', height: '24px' }}></div>
            </div>
            <div className="position-absolute bottom-0 start-50 translate-middle bg-success p-2 rounded-circle">
              <div className="bg-success-subtle rounded-circle" style={{ width: '24px', height: '24px' }}></div>
            </div>

            {/* Placeholder Lines */}
            <div className="d-flex flex-column gap-3 mt-4">
              <div className="bg-white rounded" style={{ height: '24px', width: '75%' }}></div>
              <div className="bg-white rounded" style={{ height: '24px', width: '85%' }}></div>
              <div className="bg-white rounded" style={{ height: '24px', width: '65%' }}></div>
              <div className="bg-white rounded" style={{ height: '24px', width: '50%' }}></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
