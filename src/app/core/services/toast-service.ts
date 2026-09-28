import { Service } from '@angular/core';
import { toast } from '@spartan-ng/brain/sonner';

@Service()
export class ToastService {
    showToast(title: string) {
        toast(title)
    }

    showSuccess(title: string, description: string) {
        toast.success(title, {
            description: description,
            duration: 4000,
            position: 'top-center'
        })
    }

     showError(title: string, description: string) {
        toast.error(title, {
            description: description,
            duration: 4000,
            position: 'top-center'
        })
    }

     showWarning(title: string, description: string) {
        toast.warning(title, {
            description: description,
            duration: 4000,
            position: 'top-center'
        })
    }

      showInfo(title: string, description: string) {
        toast.info(title, {
            description: description,
            duration: 4000,
            position: 'top-center'
        })
    }
}
