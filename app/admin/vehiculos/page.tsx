import Link from "next/link";
import { prisma } from "@/lib/prisma";
import VehiculosClient from "./vehiculos-client";

export default async function VehiculosPage() {
  const vehiculos = await prisma.vehiculo.findMany({ orderBy: { createdAt: "desc" } });
  return <VehiculosClient vehiculos={vehiculos} />;
}
