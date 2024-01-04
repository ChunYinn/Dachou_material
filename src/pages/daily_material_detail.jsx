import React, { useEffect, useState  } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';


export default function DailyMaterialDetail() {
  const { date } = useParams();
  return (
    <div>
      <h1>DailyMaterialDetail</h1>
      <p>{date}</p>
    </div>
  );
}
