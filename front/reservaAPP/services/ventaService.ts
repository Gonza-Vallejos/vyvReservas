import axios, { AxiosError } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../environment/config";

export const crearVenta = async (ventaData: any) => {
  try {
    console.log("ver ventas Data", ventaData);
    const token = await AsyncStorage.getItem("token");
    const response = await axios.post(
      `${API_URL}/ventas/crearVenta/`,
      ventaData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error(
      "Error al crear la venta",
      error.response?.data || error.message
    );
    throw error;
  }
};

export const obtenerVentaDetalle = async (id: number) => {
  const token = await AsyncStorage.getItem("token");
  const response = await axios.get(
    `${API_URL}/ventas/obtenerVentaDetalleGeneral/${id}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const existeReservaVenta = async (id: number): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem("token");
    const response = await axios.get(
      `${API_URL}/ventas/existeReservaVenta/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // Suponiendo que tu backend devuelve { existe: true } o { existe: false }
    return response.data.existe === true;
  } catch (error) {
    console.error(
      "Error al verificar si existe la venta para la reserva:",
      error
    );
    // Si hay un error, asumimos que no existe venta
    return false;
  }
};

export const existeVentaPorPasajero = async (
  idPasajero: number
): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem("token");

    const response = await axios.get(
      `${API_URL}/ventas/existePasajeroVenta/${idPasajero}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // El backend devuelve: { existe: true, pasajeroId: ..., reservaId: ... }
    return response.data.existe === true;
  } catch (error) {
    console.error("Error al verificar si el pasajero tiene venta:", error);
    return false;
  }
};
