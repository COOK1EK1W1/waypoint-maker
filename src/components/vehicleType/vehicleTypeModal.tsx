import Modal from "../modal/modal";

export default function VehicleTypeModal({open, onClose}: {open: boolean, onClose: ()=>void}){
  return (<Modal open={open} onClose={onClose}>
    <div>hello world</div>
  </Modal>
  )
}
