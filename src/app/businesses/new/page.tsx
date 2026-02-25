"use client";

import {
  Autocomplete,
  GoogleMap,
  MarkerF,
  useJsApiLoader,
} from "@react-google-maps/api";
import {
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  DollarSign,
  MapPin,
} from "lucide-react";
import { ChangeEvent, useRef, useState } from "react";

interface CreateShopFormProps {
  onClose: () => void;
}

const CreateShopForm = ({ onClose }: CreateShopFormProps) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    latitude: 0,
    longitude: 0,
    category: "Standard",
    basePrice: "",
    hours: "08:00 - 20:00",
    image: null as File | null,
  });
  const [coverPreview, setCoverPreview] = useState("");
  const autocompleteRef = useRef<any>(null);
  const mapRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: ["places"],
  });

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const mapCenter = {
    lat: formData.latitude || 11.5564,
    lng: formData.longitude || 104.9282,
  };

  const syncAddressFromLatLng = (lat: number, lng: number) => {
    if (!geocoderRef.current) return;
    geocoderRef.current.geocode(
      { location: { lat, lng } },
      (results: any, status: string) => {
        const address =
          status === "OK" && results && results[0]
            ? results[0].formatted_address
            : "";
        setFormData((prev) => ({
          ...prev,
          address: address || prev.address,
          latitude: lat,
          longitude: lng,
        }));
      },
    );
  };

  const handleMapClick = (e: any) => {
    if (!e?.latLng) return;
    syncAddressFromLatLng(e.latLng.lat(), e.latLng.lng());
  };

  const handleMarkerDragEnd = (e: any) => {
    if (!e?.latLng) return;
    syncAddressFromLatLng(e.latLng.lat(), e.latLng.lng());
  };

  const handlePlaceChanged = () => {
    const place = autocompleteRef.current?.getPlace?.();
    if (!place?.geometry?.location) return;
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    mapRef.current?.panTo({ lat, lng });
    mapRef.current?.setZoom(15);
    setFormData((prev) => ({
      ...prev,
      address: place.formatted_address || prev.address,
      latitude: lat,
      longitude: lng,
    }));
  };

  const handleCoverFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    if (coverPreview) {
      URL.revokeObjectURL(coverPreview);
    }
    const previewUrl = URL.createObjectURL(file);
    setCoverPreview(previewUrl);
    setFormData((prev) => ({
      ...prev,
      image: file,
    }));
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
      {/* Progress Bar */}
      <div className="bg-slate-50 px-8 py-4 flex items-center justify-between border-b border-slate-100">
        {[1, 2, 3].map((num) => (
          <div key={num} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                step >= num
                  ? "bg-blue-600 text-white"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {step > num ? <Check size={16} /> : num}
            </div>
            <span
              className={`text-xs font-bold uppercase tracking-wider ${step >= num ? "text-blue-600" : "text-slate-400"}`}
            >
              {num === 1 ? "Identity" : num === 2 ? "Services" : "Launch"}
            </span>
            {num < 3 && <div className="w-12 h-px bg-slate-200 ml-2" />}
          </div>
        ))}
      </div>

      <div className="p-10">
        {/* STEP 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <header>
              <h2 className="text-2xl font-bold text-slate-900">
                Basic Shop Info
              </h2>
              <p className="text-slate-500">
                How should customers find your shop?
              </p>
            </header>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Shop Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bubbles & Suds North"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Location Address
                </label>
                <div className="relative">
                  <MapPin
                    className="absolute left-4 top-3.5 text-slate-400"
                    size={18}
                  />
                  {isLoaded ? (
                    <Autocomplete
                      onLoad={(autocomplete) => {
                        autocompleteRef.current = autocomplete;
                      }}
                      onPlaceChanged={handlePlaceChanged}
                    >
                      <input
                        type="text"
                        placeholder="Search campus location..."
                        value={formData.address}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            address: e.target.value,
                          }))
                        }
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      />
                    </Autocomplete>
                  ) : (
                    <input
                      type="text"
                      placeholder="Search campus location..."
                      value={formData.address}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          address: e.target.value,
                        }))
                      }
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  )}
                </div>
                <div className="mt-3 space-y-2">
                  {!apiKey ? (
                    <p className="text-xs text-red-600">
                      Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY. Map picker is
                      disabled.
                    </p>
                  ) : loadError ? (
                    <p className="text-xs text-red-600">
                      Failed to load Google Maps.
                    </p>
                  ) : !isLoaded ? (
                    <p className="text-xs text-slate-500">Loading map...</p>
                  ) : (
                    <>
                      <GoogleMap
                        center={mapCenter}
                        zoom={14}
                        onLoad={(map) => {
                          mapRef.current = map;
                          const googleMaps = (window as any).google?.maps;
                          if (googleMaps) {
                            geocoderRef.current = new googleMaps.Geocoder();
                          }
                        }}
                        onClick={handleMapClick}
                        mapContainerClassName="h-64 w-full rounded-xl border border-slate-200 bg-slate-100"
                        options={{
                          mapTypeControl: false,
                          streetViewControl: false,
                        }}
                      >
                        <MarkerF
                          position={mapCenter}
                          draggable
                          onDragEnd={handleMarkerDragEnd}
                        />
                      </GoogleMap>
                      <p className="text-xs text-slate-500">
                        Click map or drag pin to set location. Lat:{" "}
                        {formData.latitude.toFixed(6)}, Lng:{" "}
                        {formData.longitude.toFixed(6)}
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-4">
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Shop Cover Photo
                </label>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  className="hidden"
                  onChange={handleCoverFileChange}
                />
                <div
                  className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer group"
                  onClick={() => coverInputRef.current?.click()}
                >
                  <div className="p-4 bg-blue-50 rounded-full text-blue-600 group-hover:scale-110 transition-transform">
                    <Camera size={32} />
                  </div>
                  <p className="mt-4 text-sm font-medium text-slate-500">
                    Click to upload shop banner
                  </p>
                  <p className="text-xs text-slate-400">PNG, JPG up to 10MB</p>
                  {formData.image && (
                    <p className="mt-2 text-xs font-medium text-emerald-600">
                      Selected: {formData.image.name}
                    </p>
                  )}
                  {coverPreview && (
                    <img
                      src={coverPreview}
                      alt="Shop cover preview"
                      className="mt-4 h-32 w-full max-w-sm rounded-xl border border-slate-200 object-cover"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Pricing & Hours */}
        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <header>
              <h2 className="text-2xl font-bold text-slate-900">
                Services & Pricing
              </h2>
              <p className="text-slate-500">
                Set your rates and operating schedule.
              </p>
            </header>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Base Price / kg
                </label>
                <div className="relative">
                  <DollarSign
                    className="absolute left-4 top-3.5 text-slate-400"
                    size={18}
                  />
                  <input
                    type="number"
                    placeholder="5.00"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Operating Hours
                </label>
                <div className="relative">
                  <Clock
                    className="absolute left-4 top-3.5 text-slate-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="08:00 - 20:00"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <h4 className="text-blue-800 font-bold text-sm mb-1">
                💡 Pro Tip
              </h4>
              <p className="text-blue-600 text-xs">
                Offering "Express Delivery" can increase your revenue by up to
                20%.
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: Confirmation */}
        {step === 3 && (
          <div className="text-center space-y-4 animate-in zoom-in-95">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check size={40} strokeWidth={3} />
            </div>
            <h2 className="text-3xl font-bold text-slate-900">Ready to go!</h2>
            <p className="text-slate-500 max-w-sm mx-auto">
              Your shop will be listed on the campus directory immediately after
              you click finish.
            </p>
            <div className="bg-slate-50 rounded-2xl p-6 text-left border border-slate-200 mt-6">
              <div className="flex justify-between mb-2">
                <span className="text-slate-400 text-sm italic">
                  Shop Name:
                </span>
                <span className="font-bold text-slate-800">
                  Bubbles & Suds North
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 text-sm italic">Category:</span>
                <span className="font-bold text-slate-800 text-sm uppercase">
                  Standard Service
                </span>
              </div>
            </div>
          </div>
        )}

        {/* NAVIGATION BUTTONS */}
        <div className="flex items-center justify-between mt-12">
          {step > 1 ? (
            <button
              onClick={prevStep}
              className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-800 transition-colors"
            >
              <ChevronLeft size={20} /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={nextStep}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 flex items-center gap-2 transition-all"
            >
              Continue <ChevronRight size={20} />
            </button>
          ) : (
            <button className="bg-blue-600 text-white px-12 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">
              Launch Shop
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateShopForm;
