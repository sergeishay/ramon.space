
import { Toaster, toastOptions  } from 'react-hot-toast'

const ToasterContext = () => {
    return (
        <div>
            <Toaster toastOptions={{duration: 4000}} />
        </div>
    )
}

export default ToasterContext;