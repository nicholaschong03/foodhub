import React from 'react';
import MainLayout from '../../common/MainLayout';
import { useLocation as useUserLocation } from '../../../hooks/useLocation';
import { GoogleMap, MarkerF, useJsApiLoader, InfoWindow, MarkerClusterer } from '@react-google-maps/api';
import Loading from '../../common/Loading';
import { getPostsWithDistance, PostWithDistance } from '../../../services/postService';
// import userLocationIcon from '../../../assets/user_location_icon.png';
import PostDetailsModal from './PostDetailsModal';
import Header from '../../common/Header';

const userLocationIcon = 'https://res.cloudinary.com/dsanama6k/image/upload/v1750516313/user_location_icon_knzfcx.png'

const MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
const MAP_CONTAINER_STYLE = { width: '100%', height: '80vh' };
// const DEFAULT_CENTER = { lat: 3.139, lng: 101.6869 }; // KL as fallback
const INFO_WINDOW_ZOOM = 15; // Show InfoWindow at this zoom or higher

const orangeClusterIcon = (count: number) => ({
  url: `data:image/svg+xml;utf8,<svg width='48' height='48' xmlns='http://www.w3.org/2000/svg'><circle cx='24' cy='24' r='22' fill='orange' stroke='white' stroke-width='4'/><text x='24' y='30' font-size='20' text-anchor='middle' fill='white' font-family='Arial' font-weight='bold'>${count}</text></svg>`,
  scaledSize: new window.google.maps.Size(48, 48),
  anchor: new window.google.maps.Point(24, 24),
});

// Debounce utility
function useDebouncedCallback(callback: (...args: any[]) => void, delay: number) {
  const timeoutRef = React.useRef<number | null>(null);
  return React.useCallback((...args: any[]) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
}

const ExploreScreen: React.FC = () => {
  const { location, error, loading, refreshLocation } = useUserLocation();
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: MAPS_API_KEY,
    libraries: ['places'],
  });
  const [posts, setPosts] = React.useState<PostWithDistance[]>([]);
  const mapRef = React.useRef<google.maps.Map | null>(null);
  const [zoom, setZoom] = React.useState<number>(16);
  const [hasCentered, setHasCentered] = React.useState(false);
  const [selectedPostId, setSelectedPostId] = React.useState<string | null>(null);

  // Get userId from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id || user._id;

  // Debounced fetch for posts
  const fetchPosts = React.useCallback((center: { lat: number; lng: number }) => {
    getPostsWithDistance(1, 10, { latitude: center.lat, longitude: center.lng }).then(res => {
      setPosts(res.posts.filter(p => p.restaurant?.location));
    });
  }, []);
  const debouncedFetchPosts = useDebouncedCallback(fetchPosts, 500);

  // Handler to update like count in posts state
  const handleUpdatePostLike = async (postId: string, likesCount: number, liked: boolean) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post.id === postId
          ? { ...post, likes: likesCount, liked }
          : post
      )
    );
  };

  // Debug function to handle post selection from search
  const handlePostSelect = (postId: string) => {
    console.log('Post selected from search:', postId);
    setSelectedPostId(postId);
  };

  // Initial fetch on location load
  React.useEffect(() => {
    if (location && isLoaded && !hasCentered) {
      fetchPosts({ lat: location.latitude, lng: location.longitude });
    }
  }, [location, isLoaded, fetchPosts, hasCentered]);

  // Handler for zoom changes
  const handleZoomChanged = () => {
    if (mapRef.current) {
      setZoom(mapRef.current.getZoom() || 16);
    }
  };

  // Handler for map idle (after move/zoom)
  const handleMapIdle = () => {
    if (mapRef.current) {
      const center = mapRef.current.getCenter();
      if (center) {
        debouncedFetchPosts({ lat: center.lat(), lng: center.lng() });
      }
    }
  };

  // Custom cluster renderer for orange clusters
  const clusterRenderer = ({ count, position }: any) => {
    return new window.google.maps.Marker({
      position,
      icon: orangeClusterIcon(count),
      label: undefined,
    });
  };

  // Inject style to hide InfoWindow close button
  React.useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `.gm-style-iw button.gm-ui-hover-effect { display: none !important; }`;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  return (
    <MainLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Explore Nearby</h1>
        {loading || !isLoaded ? (
          <Loading />
        ) : error || loadError ? (
          <div className="text-red-500 text-center">
            {error || (loadError && loadError.message) || 'Unknown error'}
            <button onClick={refreshLocation} className="ml-4 px-3 py-1 bg-orange-500 text-white rounded">Retry</button>
          </div>
        ) : (
          <>
            <Header onPostSelect={handlePostSelect} />
            <GoogleMap
              mapContainerStyle={MAP_CONTAINER_STYLE}
              center={(!hasCentered && location) ? { lat: location.latitude, lng: location.longitude } : undefined}
              zoom={location ? 16 : 6}
              onLoad={map => {
                mapRef.current = map;
                if (location && !hasCentered) {
                  map.panTo({ lat: location.latitude, lng: location.longitude });
                  setHasCentered(true);
                }
              }}
              onZoomChanged={handleZoomChanged}
              onIdle={handleMapIdle}
            >
              {/* User marker */}
              {location && (
                <MarkerF
                  position={{ lat: location.latitude, lng: location.longitude }}
                  icon={{
                    url: userLocationIcon,
                    scaledSize: new window.google.maps.Size(62, 62),
                    origin: new window.google.maps.Point(0, 0),
                    anchor: new window.google.maps.Point(24, 48),
                  }}
                  zIndex={999}
                />
              )}
              {/* Clusters and Markers */}
              {zoom < INFO_WINDOW_ZOOM ? (
                <MarkerClusterer
                  options={{
                    imagePath: '', // disables default cluster icons
                  }}
                  // @ts-ignore: renderer is not typed in @react-google-maps/api but is supported
                  renderer={clusterRenderer}
                >
                  {(clusterer: any) => (
                    <>
                      {posts.map(post =>
                        post.restaurant?.location && (
                          <MarkerF
                            key={post.id}
                            position={{
                              lat: post.restaurant.location.latitude,
                              lng: post.restaurant.location.longitude
                            }}
                            clusterer={clusterer}
                          />
                        )
                      )}
                    </>
                  )}
                </MarkerClusterer>
              ) : (
                // Show InfoWindows for all posts when zoomed in, show menu item name above image, offset x and y to reduce stacking
                posts.map((post, idx) =>
                  post.restaurant?.location && (
                    <InfoWindow
                      key={post.id}
                      position={{
                        lat: post.restaurant.location.latitude,
                        lng: post.restaurant.location.longitude
                      }}
                      options={{
                        pixelOffset: new window.google.maps.Size((idx % 5) * 30 - 60, -30 - idx * 10),
                        disableAutoPan: true,
                      }}
                    >
                      <div
                        className={`w-40 text-center cursor-pointer transition-transform duration-200 hover:scale-105 hover:shadow-lg bg-white rounded ${selectedPostId === post.id ? 'ring-2 ring-orange-400' : ''}`}
                        onClick={() => handlePostSelect(post.id)}
                      >
                        <div className="font-semibold text-base text-gray-800 truncate mb-1">{post.menuItemName}</div>
                        <img src={post.imageUrl} alt={post.menuItemName} className="w-full h-24 object-cover rounded" />
                      </div>
                    </InfoWindow>
                  )
                )
              )}
            </GoogleMap>
            {/* Post Details Modal */}
            {selectedPostId && (
              <PostDetailsModal
                postId={selectedPostId}
                onClose={() => setSelectedPostId(null)}
                currentUserId={userId}
                onLikeUpdate={handleUpdatePostLike}
              />
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default ExploreScreen;