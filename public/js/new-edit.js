$(document).ready(function () {
// Barcode scanner routines
    (function () {
        var scanners = [];
        try {
            scanners = Rho.Barcode.enumerate();

        }
        catch (e) {
            console.log("Barcode API is not found");
            return;
        }


        var lastScannedCode;
        var barcodeCallback = function (code) {
            var qty = parseInt($("#inventoryItem\\[quantity\\]").val());
            if (isNaN(qty)) {
                qty = 0;
            }
            console.log("qty", qty);
            console.log("lastScannedCode", lastScannedCode);
            console.log("code", code);
            console.log(lastScannedCode === code);
            if (lastScannedCode === code) {
                qty++;
            } else {
                $("#inventoryItem\\[upc\\]").val(code);
                lastScannedCode = code;
                qty = 1;
            }
            $("#inventoryItem\\[quantity\\]").val(qty);
        };

        var barcodeHardwareScannerCallback = function (params) {
            if (params.data != null) {
                barcodeCallback(params.data);
            }
        };

        var barcodeCameraScannerCallback = function (params) {
            if (params.status === "ok") {
                barcodeCallback(params.barcode);
            }
        };

        var scanner = Rho.Barcode.getDefault();


        if (Rho.Config.isPropertyExists("barcodeScanner")) {
            var storedName = Rho.Config.getPropertyString("barcodeScanner");
            for (var i = 0; i < scanners.length; i++) {
                var scannerName = scanners[i].friendlyName;
                if (((scannerName == null) && (storedName === "")) || (scannerName == storedName)) {
                    scanner = scanners[i];
                    //break;
                }
                scanners[i].disable()
            }
        }
        if (scanner.scannerType !== "Camera") {
            scanner.enable({}, barcodeHardwareScannerCallback)
        } else {
            $("#takeBarcodeBtn").on("click", function () {
                scanner.take({}, barcodeCameraScannerCallback)
            });
        }
    })();

// Camera routines
    (function () {
        $("#takePhotoBtn").on("click", function () {
            var photoFilename = Rho.RhoFile.join(Rho.Application.databaseBlobFolder, new Date().getTime().toString());
            Rho.Camera.takePicture({fileName: photoFilename}, function (params) {
                if (params.status === "ok") {
                    var imagePath = params.imageUri;
                    if (Rho.System.platform === Rho.System.PLATFORM_WM_CE) {
                        imagePath = params.imageUri.slice(1)
                    }

                    $("#photo").removeClass("hidden");
                    $("#photo").find("img").attr("src", imagePath);
                    $("#photo").find("input").attr("value", imagePath);
                    $("#takePhotoBtn").addClass("hidden");
                }
            })
        });


        $("#deletePhotoBtn").on("click", function () {
            $("#takePhotoBtn").removeClass("hidden");
            $("#photo").addClass("hidden");
            $("#photo").find("img").attr("src", "");
            $("#photo").find("input").attr("value", "");
        });

    })();

// Signature routines
    (function () {
        $("#takeSignatureBtn").on("click", function () {
            var signatureFilename = Rho.RhoFile.join(Rho.Application.databaseBlobFolder, new Date().getTime().toString());
            Rho.Signature.takeFullScreen({fileName: signatureFilename}, function (params) {
                if (params.status === "ok") {
                    var id = "#signature";
                    $(id).removeClass("hidden");
                    $(id).find("img").attr("src", params.imageUri.slice(7));
                    $(id).find("input").attr("value", params.imageUri.slice(7));
                }
            })
        })
    })();

// User input validation
    (function () {
        var validateUserInput = function (element) {
            toastr.remove();
            if ($(element).find("#inventoryItem\\[upc\\]").val() === "") {
                toastr.error("Field \"UPC\" must be filled", 'Error!');
                return false;
            }
            if ($(element).find("#inventoryItem\\[productName\\]").val() === "") {
                toastr.error("Field \"Product name\" must be filled", 'Error!');
                return false;
            }
            if ($(element).find("#inventoryItem\\[quantity\\]").val() === "") {
                toastr.error("Field \"Quantity\" must be greater then zero", 'Error!');
                return false;
            }
            if ($(element).find("#inventoryItem\\[employeeId\\]").val() === "") {
                toastr.error("Field \"Employee ID\" must be filled", 'Error!');
                return false;
            }
            if ($(element).find("#inventoryItem\\[photoUri\\]").val() === "") {
                toastr.error("A photo of product is required", 'Error!');
                return false;
            }
            if ($(element).find("#inventoryItem\\[signatureUri\\]").val() === "") {
                toastr.error("A signature of the employee if required", 'Error!');
                return false;
            }
            return true;
        };

        $("form").submit(function (e) {
            e.preventDefault();
            var form = this;
            if (validateUserInput(form)) {
                form.submit();
            }
        });


    })()
});