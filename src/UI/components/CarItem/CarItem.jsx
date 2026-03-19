import React from "react";

const CarItem = ({car}) => {
  return (
    <div key={car.id} className="car-card">
      <img
        className="car-image"
        style={{ objectFit: "contain" }}
        src={car.url}
      />

      <div className="car-info">
        <div className="car-header">
          <span className="car-name">{car.name}</span>
          <span className="car-year">{car.year}</span>
        </div>
        <div className="car-stats">
          <div className="car-stat-item">
            <i className="fas fa-road"></i> {car.mileage.toLocaleString()} км
          </div>
          <div className="car-stat-item">
            <i className="fas fa-tachometer-alt"></i> {car.fuelConsumption}{" "}
            {car.fuelUnit}
          </div>
          <div className="car-stat-item">
            <i className="fas fa-oil-can"></i> {car.serviceNote}
          </div>
        </div>
        <div className="progress-bar-bg">
          <div
            className="progress-fill"
            style={{ width: `${car.serviceProgress}%` }}
          ></div>
        </div>
        <div className="service-warning">
          <span>
            <i className="far fa-clock"></i> Следующее ТО
          </span>
          <span>через {car.nextService.toLocaleString()} км</span>
        </div>
      </div>
    </div>
  );
};

export default CarItem;
