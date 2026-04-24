import React from "react";

const CarItem = ({ car }) => {
  return (
    <div key={car.id} className="car-card">
      <img
        className="car-image"
        style={{ objectFit: "cover", objectPosition: "left" }}
        src={car.image}
      />

      <div className="car-info">
        <div className="car-header">
          <span className="car-name">
            {car.mark} {car.model}
          </span>
          <span className="car-year">{car.year}</span>
        </div>
        <div className="car-stats">
          <div className="car-stat-item">
            <i className="fas fa-road"></i> {car.mileageKM} км
          </div>
          <div className="car-stat-item">
            <i className="fas fa-tachometer-alt"></i> {car.consumption}{" "}
            {car.fuelUnit}
          </div>
        </div>
        <div className="progress-bar-bg">
          <div
            className="progress-fill"
            style={{
              width: `${Math.round(
                (car.distanceCovered / car.maintanceDistance) * 100
              )}%`,
            }}
          ></div>
        </div>
        <div className="service-warning">
          <span>
            <i className="far fa-clock"></i> Следующее ТО
          </span>
          <span>через {car.maintanceDistance - car.distanceCovered} км</span>
        </div>
      </div>
    </div>
  );
};

export default CarItem;
