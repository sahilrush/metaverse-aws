import React from 'react';
import {
  LiveKitRoom,
  GridLayout,
  ParticipantTile,
  useTracks,
  RoomAudioRenderer,
} from '@livekit/components-react';
import { Track } from 'livekit-client';
import { VideoCallProps } from '../types';

function VideoGrid() {
  const tracks = useTracks([
    Track.Source.Camera,
    Track.Source.Microphone,
    Track.Source.ScreenShare,
  ]);

  return (
    <GridLayout tracks={tracks} className="h-full">
      <ParticipantTile />
    </GridLayout>
  );
}

export function VideoCall({ player, token }: VideoCallProps) {
  if (!token) return null;

  return (
    <div className="absolute bottom-4 right-4 w-64 h-48 bg-black/80 rounded-lg overflow-hidden">
      <LiveKitRoom
        token={token}
        serverUrl="wss://demo.livekit.cloud"
        connect={true}
        audio={false}
        video={false}
        onError={(error) => console.error('LiveKit error:', error)}
      >
        <VideoGrid />
        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
}