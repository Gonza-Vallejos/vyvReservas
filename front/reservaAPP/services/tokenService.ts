import { jwtDecode } from "jwt-decode";
interface TokenPayload {
  id: number;
  nombre: string;
  usuario: string;
  perfil: string;
  empresa_id: number;
  iat: number;
  exp: string;
}
export const decodeToken = (token: any) => {
  try {
    const decoded = jwtDecode<TokenPayload>(token);

    if (!decoded) {
      console.warn("El token no contiene un payload válido");
      return null;
    }

    if (!decoded.perfil || typeof decoded.perfil !== "string" || decoded.perfil.trim() === "") {
      decoded.perfil = "usuarioCliente";
    }

    return decoded;
  } catch (error) {
    console.error("Token inválido o mal formado:", error);
    return null;
  }
};
