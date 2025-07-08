import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useContracts } from "../hooks/useContracts";
import { usePinata } from "../hooks/usePinata";

function MintNFT() {
  const { address } = useAccount();
  const { diploNFT } = useContracts();
  const { uploadNFTToPinata, uploading } = usePinata();

  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const { data: mintData, writeContract: mintNFT } = useWriteContract();

  const { isLoading: isMinting } = useWaitForTransactionReceipt({
    hash: mintData,
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleMint = async (e) => {
    e.preventDefault();

    if (!file || !name || !description) {
      alert("Por favor completa todos los campos");
      return;
    }

    try {
      // Subir a Pinata
      const result = await uploadNFTToPinata(file, name, description);

      if (!result.success) {
        alert("Error subiendo a IPFS: " + result.error);
        return;
      }

      // Mostrar info si se usan placeholders
      if (result.isPlaceholder) {
        console.log('📝 Usando placeholders para testing (credenciales de Pinata no válidas)');
      }

      // Mintear NFT
      mintNFT({
        address: diploNFT.address,
        abi: diploNFT.abi,
        functionName: "mint",
        args: [address, result.metadataUrl],
      });
    } catch (error) {
      console.error("Error minting NFT:", error);
      alert("Error creando NFT");
    }
  };

  return (
    <div className="mint-nft">
      <h2>Crear nuevo NFT</h2>
      <form onSubmit={handleMint} className="mint-form">
        <div className="form-group">
          <label>Imagen:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Nombre:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Descripción:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Precio (DIP tokens):</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Precio para listar en el marketplace"
          />
        </div>

        <button
          type="submit"
          disabled={uploading || isMinting}
          className="mint-button"
        >
          {uploading
            ? "Subiendo a IPFS..."
            : isMinting
            ? "Minteando..."
            : "Crear NFT"}
        </button>
      </form>
    </div>
  );
}

export default MintNFT;
