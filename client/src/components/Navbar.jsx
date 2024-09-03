import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const navigation = [
  { name: "Home", href: "/", current: false },
  { name: "Buy Token", href: "/buy-token", current: false },
  { name: "Sell Token", href: "/sell-token", current: false },
  { name: "My Token", href: "/my-token", current: false },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

// Utility function to shorten the account string
const shortenText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  const half = Math.floor(maxLength / 2);
  return `${text.slice(0, half)}...${text.slice(-half)}`;
};

// Function to handle copy to clipboard
const handleCopyToClipboard = (text) => {
  navigator.clipboard.writeText(text).then(
    () => {
      toast.success("Account address copied to clipboard!");
    },
    (err) => {
      toast.error(
        <div>
          Failed to Copy Account Address
          <br />
          {err}
        </div>
      );
    }
  );
};

const Navbar = ({ account }) => {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if (account.length === 0) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [account]);
  return (
    <Disclosure as="nav" className="bg-[#AFD198]">
      {({ open }) => (
        <>
          <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
            <div className="relative flex h-16 items-center justify-between">
              <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                {/* Mobile menu button*/}
                <DisclosureButton className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                  <span className="absolute -inset-0.5" />
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </DisclosureButton>
              </div>
              <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                <div className="flex flex-shrink-0 items-center">
                  <Link to="/">
                    <p className="text-[#000]">Carbon Trading App</p>
                  </Link>
                </div>
                <div className="hidden sm:ml-6 md:ml-auto sm:block">
                  <div className="flex space-x-4">
                    {navigation.map((item) => (
                      <Link to={item.href}>
                        <p
                          key={item.name}
                          className={classNames(
                            item.current
                              ? "bg-gray-900 text-black"
                              : "text-[#000] hover:bg-[#D8EFD3] hover:text-black ",
                            "rounded-md px-3 py-2 text-sm font-medium transition duration-300 ease-in-out"
                          )}
                          aria-current={item.current ? "page" : undefined}
                        >
                          {item.name}
                        </p>
                      </Link>
                    ))}
                    <p
                      key={account}
                      className={classNames(
                        "text-[#000] hover:bg-[#D8EFD3] hover:text-black rounded-md px-3 py-2 text-sm font-medium transition duration-300 ease-in-out"
                      )}
                      onClick={() => handleCopyToClipboard(account)}
                    >
                      {isLoading
                        ? "Loading Account..."
                        : shortenText(account, 10)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DisclosurePanel className="sm:hidden">
            <div className="space-y-1 px-2 pb-3 pt-2">
              {navigation.map((item) => (
                <DisclosureButton
                  key={item.name}
                  as="a"
                  href={item.href}
                  className={classNames(
                    item.current
                      ? "bg-gray-900 text-black"
                      : "text-[#000] hover:bg-[#D8EFD3] hover:text-black",
                    "block rounded-md px-3 py-2 text-base font-medium transition duration-300 ease-in-out"
                  )}
                  aria-current={item.current ? "page" : undefined}
                >
                  {item.name}
                </DisclosureButton>
              ))}
            </div>
          </DisclosurePanel>
        </>
      )}
    </Disclosure>
  );
};
export default Navbar;
