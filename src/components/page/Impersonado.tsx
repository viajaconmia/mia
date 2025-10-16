import ROUTES from "../../constants/routes";
import Button from "../atom/Button";
import { Logo } from "../atom/Logo";

export const Impersonado = () => {
  return (
    <>
      <div className="w-full h-full flex flex-col justify-center items-center ">
        <div className="bg-gray-50 flex flex-col justify-center items-center p-4 space-y-2 rounded-md">
          <Logo className="w-20 h-20"></Logo>
          <h1>{`Has entrado con exito!, te recomiendo ir a la siguiente ruta`}</h1>
          <Button
            onClick={() =>
              window.location.replace(ROUTES.CONSULTAS.SUBPATH("general"))
            }
          >
            Ir a ver sus registros
          </Button>
        </div>
      </div>
    </>
  );
};
