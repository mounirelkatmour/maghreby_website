"use client";
import React from 'react';
import type { ServiceData } from '../../../utils/fetch_services';
import DetailsPage from '../../../components/DetailsPage';

interface Params {
  type: string;
  id: string;
}

export default function ServiceDetailsPage({ params }: { params: Promise<Params> }) {
  const { id, type } = React.use(params);
  return (
    <DetailsPage serviceId={id} serviceType={type as keyof ServiceData} />
  );
}
