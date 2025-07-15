import Button from "../atom/Button";
import ButtonList from "../molecule/ButtonList";

export const Facturacion = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Facturación</h1>
      <p className="text-gray-600">Esta es la página de facturación.</p>
      <Button variant="primary">Hola</Button>
      <Button variant="secondary">Hola</Button>
      <Button variant="ghost">Hola</Button>
      <ButtonList></ButtonList>
    </div>
  );
};
