/* global window */
import React, { useState, useEffect, useCallback } from "react";

import DeckGL from '@deck.gl/react';
import {Map} from 'react-map-gl';

import {AmbientLight, PointLight, LightingEffect} from '@deck.gl/core';
import {TripsLayer} from '@deck.gl/geo-layers';
import {IconLayer} from "@deck.gl/layers";

import Slider from "@mui/material/Slider";
import "../css/trip.css";

/* ============================================
   조명 및 재질 설정
============================================ */
const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0
});

const pointLight = new PointLight({
  color: [255, 255, 255],
  intensity: 2.0,
  position: [-74.05, 40.7, 8000]
});

const lightingEffect = new LightingEffect({ambientLight, pointLight});

const material = {
  ambient: 0.1,
  diffuse: 0.6,
  shininess: 32,
  specularColor: [60, 64, 70]
};

const material2 = {
  ambient: 0.3,
  diffuse: 0.6,
  shininess: 32,
  specularCol: [60, 64, 70]
};

/* ============================================
   기본 테마 설정
============================================ */
const DEFAULT_THEME = {
  buildingColor: [228, 228, 228],
  buildingColor2: [255, 255, 255],
  trailColor0: [253, 128, 93],
  trailColor1: [23, 184, 190],
  material,
  material2,
  effects: [lightingEffect]
};

/* ============================================
   초기 지도 상태 설정
============================================ */
const INITIAL_VIEW_STATE = { 
  longitude: 126.982695, // 서울 중심
  latitude: 37.532221, 
  zoom: 11,
  pitch: 30,
  bearing: 0
};

/* ============================================
상수 및 헬퍼 함수
============================================ */
const ICON_MAPPING = {
  marker: { x: 0, y: 0, width: 128, height: 128, mask: true },
};

const animationSpeed = 100;
const mapStyle = "mapbox://styles/spear5306/ckzcz5m8w002814o2coz02sjc";
const MAPBOX_TOKEN = `pk.eyJ1Ijoic2hlcnJ5MTAyNCIsImEiOiJjbG00dmtic3YwbGNoM2Zxb3V5NmhxZDZ6In0.ZBrAsHLwNihh7xqTify5hQ`;

// 최소, 최대 시간 설정 (min ~ max)
const minTime = 0; // min
const maxTime = 1500; // max

// 애니메이션 시간 업데이트
const returnAnimationTime = (time) => {
    if (time > maxTime) {
      return minTime;
    } else {
      return time + 0.01 * animationSpeed;
    }
};

// 시간을 시/분 형식으로 변환
const returnAnimationDisplayTime = (time) => {
  // 숫자를 두 자리로 맞추는 헬퍼 함수
  const addZeroFill = (value) => value.toString().padStart(2, "0");

  // 초 단위를 시와 분으로 변환
  const hour = addZeroFill(Math.floor(time / 3600)); // 1시간 = 3600초
  const minute = addZeroFill(Math.floor((time % 3600) / 60)); // 3600초 나머지 ÷ 60
  return [hour, minute];
};


/* ============================================
   데이터 정의
============================================ */
const start_points = [
  {'name': '관악1sub터미널', 'coordinates': [126.87877, 37.481974]},
  {'name': '서대문구sub터미널', 'coordinates': [126.7653867, 37.6495]},
  {'name': '성동구sub터미널', 'coordinates': [127.1473857, 37.5823781]},
];

const middle_points = [
  {'name': '신림동 주민센터', 'coordinates': [126.927095, 37.487399]},
  {'name': '홍은동 주민센터', 'coordinates': [126.946994, 37.59958]},
  {'name': '행당동 주민센터', 'coordinates': [127.036352, 37.559477]},
  {'name': '금호동 주민센터', 'coordinates': [127.021602, 37.555372]},
];

const stop_points = {
  "home2": [126.927889, 37.486959],
  "home4": [126.928085, 37.486300],
  "home5": [126.928528, 37.486501],
  "home6": [126.928775, 37.485665],
  "home7": [126.928041, 37.485027],
  "home8": [126.927470, 37.484800],
  "home9": [126.927185, 37.484897],
  "home11": [126.927358, 37.485457],
  "home12": [126.928110, 37.486413],
  "home13": [126.926612, 37.486137],
  "home14": [126.926905, 37.486493],
  "home15": [126.926123, 37.486979],
  "home16": [126.925733, 37.487433],
  "home17": [126.925151, 37.486567],
  "home18": [126.925955, 37.486268],
  "home19": [126.925445, 37.485901],
  "home20": [126.925938, 37.485551]
};

const end_points = {
  "home 1": [126.928485, 37.487397],
  "home3": [126.928131, 37.485849],
  "home10": [126.926831, 37.484975]
};

/* ============================================
   메인 컴포넌트: Trip
============================================ */
const Trip = ({ trip_car, trip_foot }) => {
  const [time, setTime] = useState(0);
  const [animation] = useState({});

  const animate = useCallback(() => {
    setTime((time) => returnAnimationTime(time));
    animation.id = window.requestAnimationFrame(animate);
  }, [animation]);

  useEffect(() => {
    animation.id = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(animation.id);
  }, [animation, animate]);

  const layers = [
    // 시작 지점
    new IconLayer({
      id: "start-points",
      data: start_points,
      sizeScale: 10,
      iconAtlas: "https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png",
      iconMapping: ICON_MAPPING,
      getIcon: () => "marker",
      getSize: 3,
      getPosition: (d) => d.coordinates,
      getColor: [0, 128, 255], // 파란색
      opacity: 1,
    }),
    // 중간 지점
    new IconLayer({
      id: "middle-points",
      data: middle_points,
      sizeScale: 10,
      iconAtlas: "https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png",
      iconMapping: ICON_MAPPING,
      getIcon: () => "marker",
      getSize: 3,
      getPosition: (d) => d.coordinates,
      getColor: [34, 139, 34], // 녹색
      opacity: 1,
    }),
    // 정류장
    new IconLayer({
      id: "stop-points",
      data: Object.entries(stop_points).map(([name, coordinates]) => ({ name, coordinates })),
      sizeScale: 10,
      iconAtlas: "https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png",
      iconMapping: ICON_MAPPING,
      getIcon: () => "marker",
      getSize: 2,
      getPosition: (d) => d.coordinates,
      getColor: [255, 0, 0], // 빨간색
      opacity: 1,
    }),

    // 마지막 정류장
    new IconLayer({
      id: "end-points",
      data: Object.entries(end_points).map(([name, coordinates]) => ({ name, coordinates })),
      sizeScale: 10,
      iconAtlas: "https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/icon-atlas.png",
      iconMapping: ICON_MAPPING,
      getIcon: () => "marker",
      getSize: 2,
      getPosition: (d) => d.coordinates,
      getColor: [255, 255, 0], // 빨간색
      opacity: 1,
    }),
    // 차량 경로
    new TripsLayer({
      id: 'trips-car',
      data: trip_car,
      getPath: (d) => d.route,
      getTimestamps: (d) => d.timestamp,
      getColor: [255, 255, 0], // 노란색
      opacity: 1,
      widthMinPixels: 5,
      trailLength: 50,
      currentTime: time,
    }),
    // 도보 경로
    new TripsLayer({
      id: 'trips-foot',
      data: trip_foot,
      getPath: (d) => d.route,
      getTimestamps: (d) => d.timestamp,
      getColor: [255, 0, 255], // 핑크색
      opacity: 1,
      widthMinPixels: 5,
      trailLength: 20,
      currentTime: time,
    }),
  ];

  const [hour, minute] = returnAnimationDisplayTime(time);

  return (
    <div className="trip-container" style={{ position: "relative" }}>
      <DeckGL
        effects={DEFAULT_THEME.effects}
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={layers}
      >
        <Map 
          mapStyle={mapStyle}
          mapboxAccessToken={MAPBOX_TOKEN}
          preventStyleDiffing={true}
        />
      </DeckGL>
    {/* Legend 이미지 추가 */}
    <div className="legend"></div>
      <h1 className="time">TIME : {`${hour} : ${minute}`}</h1>
      <Slider
        id="slider"
        value={time}
        min={minTime}
        max={maxTime}
        onChange={(e) => setTime(e.target.value)}
        track="inverted"
      />
    </div>
  );
};

export default Trip;
