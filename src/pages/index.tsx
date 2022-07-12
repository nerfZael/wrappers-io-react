import PublishWrapperModal from "../components/PublishWrapperModal";
import Navigation from "../components/navigation";
import { WRAPPERS_GATEWAY_URL } from "../constants";

import { ReactElement, useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import { useEthers } from "@usedapp/core";
import axios from "axios";
import "react-app-polyfill/stable";
import "react-app-polyfill/ie11";
import "core-js/features/array/find";
import "core-js/features/array/includes";
import "core-js/features/number/is-nan";

const Home = (): ReactElement<any, any> => {
  const { account, library: provider } = useEthers();
  const [indexedWrappers, setIndexedWrappers] = useState<any[]>([]);
  const [cidToPublish, setCidToPublish] = useState<string | undefined>();
  const [shouldShowPublishModal, setShouldShowPublishModal] = useState(false);
  const [shouldShowWnsModal, setShouldShowWnsModal] = useState(false);

  useEffect(() => {
    axios.get(`${WRAPPERS_GATEWAY_URL}/pins?json=true`).then((result) => {
      setIndexedWrappers(result.data);
    });
  }, []);

  const publishModal =
    cidToPublish || shouldShowPublishModal ? (
      <PublishWrapperModal
        publishedCID={cidToPublish}
        handleClose={() => {
          setCidToPublish(undefined);
          setShouldShowPublishModal(false);
        }}
      />
    ) : (
      ""
    );

  return (
    <div>
      <Navigation></Navigation>
      <div className="page">
        <h1>Dashboard</h1>

        <div className="widgets-container">
          {account && (
            <>
              <div className="second-column">
                <button
                  className="btn btn-success"
                  onClick={() => setShouldShowPublishModal(true)}
                >
                  Load wrapper
                </button>
              </div>
            </>
          )}
        </div>

        <div className="widget">
          <table className="table" cellSpacing="3" cellPadding="3">
            <thead>
              <tr>
                <th>Name</th>
                <th>Manifest Version</th>
                <th>Type</th>
                <th>Size</th>
                <th>Indexes</th>
                <th>CID</th>
              </tr>
            </thead>
            <tbody>
              {indexedWrappers.map((wrapper: any, index) => (
                // <Link key={index} href={`/wrapper?cid=${wrapper.cid}`}>
                //   <tr>
                //     <td>
                //       <span>{wrapper.name}</span>
                //     </td>
                //     <td>
                //       <span>{wrapper.size}</span>
                //     </td>
                //     <td>{wrapper.cid}</td>
                //   </tr>
                // </Link>

                <tr key={index} onClick={() => setCidToPublish(wrapper.cid)}>
                  <td>
                    <span>{wrapper.name}</span>
                  </td>
                  <td>
                    <span>{wrapper.version}</span>
                  </td>
                  <td>
                    <span>{wrapper.type}</span>
                  </td>
                  <td>
                    <span>{wrapper.size}</span>
                  </td>
                  <td>
                    <span>
                      {wrapper.indexes.reduce(
                        (a: string, b: string) => a + ", " + b
                      )}
                    </span>
                  </td>
                  <td>{wrapper.cid}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {publishModal}
        <ToastContainer />
      </div>
    </div>
  );
};

export default Home;
