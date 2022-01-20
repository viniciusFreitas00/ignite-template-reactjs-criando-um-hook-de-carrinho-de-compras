import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import {
  Product, //, Stock
} from "../types";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@cartData");

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  useEffect(() => {
    localStorage.setItem("@cartData", JSON.stringify(cart));
  }, [cart]);

  const addProduct = async (productId: number) => {
    try {
      const findProductIndex = (product: Product) => product.id === productId;
      const productIndex = cart.findIndex(findProductIndex);

      if (productIndex === -1) {
        const { data } = await api.get(`/products/${productId}`);

        setCart((state) => [...state, { ...data, amount: 1 }]);
      } else {
        let newArray = cart;
        const productAmount = newArray[productIndex].amount;
        const isProductAvaible = await verifyStockAvaible(
          productId,
          productAmount
        );

        if (isProductAvaible) {
          newArray[productIndex].amount = productAmount + 1;

          setCart([...newArray]);
        } else {
          toast.warn("Limite de estoque atingido!");
        }
      }
    } catch {
      toast.error("Não foi possível adicionar o item ao carrinho!");
    }
  };

  const verifyStockAvaible = async (productId: number, amount: number) => {
    const { data } = await api.get(`/stock/${productId}`);

    return data.amount > amount;
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
    } catch {
      // TODO
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {

      if(amount === +1){
        addProduct(productId)
      } else {
        const findProductIndex = (product: Product) => product.id === productId;
        const productIndex = cart.findIndex(findProductIndex);
        let newArray = cart;
        
        newArray[productIndex].amount = newArray[productIndex].amount + amount;
        setCart([...newArray]);
      }
      

    } catch {
      // TODO
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
