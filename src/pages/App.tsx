import { Network } from "../utils/Network";
import { constants } from "../constants";
import WnsModal from "../components/wns-modal/WnsModal";
import PublishWrapperModal from "../components/publish-wrapper-modal/PublishWrapperModal";

import { ReactElement, useEffect, useState } from "react";
import { ToastContainer } from "react-toastify";
import { useEthers } from "@usedapp/core";
import axios from "axios";

const App = (): ReactElement<any, any> => {
  const {
    account,
    activateBrowserWallet,
    library: provider,
    chainId,
  } = useEthers();
  const [indexedWrappers, setIndexedWrappers] = useState<any[]>([]);
  const [cidToPublish, setCidToPublish] = useState<string | undefined>();
  const [shouldShowPublishModal, setShouldShowPublishModal] = useState(false);
  const [shouldShowWnsModal, setShouldShowWnsModal] = useState(false);

  const connectWallet = async () => {
    await activateBrowserWallet();
  };

  useEffect(() => {
    axios
      .get(`${constants.WRAPPERS_GATEWAY_URL}/pins?json=true`)
      .then((result) => {
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
    <div className="App">
      <h1>Wrappers Dashboard</h1>
      <span>
        {Network.fromChainId(chainId).name}: {account}
      </span>

      <div className="widgets-container">
        {!account && (
          <div className="second-column">
            <button className="btn btn-success" onClick={connectWallet}>
              Connect
            </button>
          </div>
        )}
        {account && (
          <>
            <div className="second-column">
              <button
                className="btn btn-success"
                onClick={() => setShouldShowPublishModal(true)}
              >
                Publish
              </button>
            </div>
            <div className="second-column">
              <button
                className="btn btn-success"
                onClick={() => setShouldShowWnsModal(true)}
              >
                WNS
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
              <th>Size</th>
              <th>CID</th>
            </tr>
          </thead>
          <tbody>
            {indexedWrappers.map((wrapper: any, index) => (
              <tr key={index} onClick={() => setCidToPublish(wrapper.cid)}>
                <td>
                  <span>{wrapper.name}</span>
                </td>
                <td>
                  <span>{wrapper.size}</span>
                </td>
                <td>{wrapper.cid}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {publishModal}
      <WnsModal
        shouldShow={shouldShowWnsModal}
        handleClose={() => {
          setShouldShowWnsModal(false);
        }}
      ></WnsModal>
      <ToastContainer />
    </div>
  );
};

export default App;
