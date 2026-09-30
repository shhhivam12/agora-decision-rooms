import React from 'react';
jest.mock('../src/ui/LiveVoiceScreen', () => require('../src/ui/LiveVoiceScreen.web'));
import renderer, { act } from 'react-test-renderer';
import { HomeScreen } from '../src/ui/HomeScreen';
import { OutingRoomScreen } from '../src/ui/OutingRoomScreen';
import { CreateRoomScreen } from '../src/ui/CreateRoomScreen';
import { FriendsScreen } from '../src/ui/FriendsScreen';
import { ProfileScreen } from '../src/ui/ProfileScreen';
import { RoomsScreen } from '../src/ui/RoomsScreen';
import { AppContent } from '../App';

describe('RoundTable mobile shell', () => {
  it('starts an outing room from the social home action', () => {
    const onCreateRoom = jest.fn();
    let tree: renderer.ReactTestRenderer;
    act(() => { tree = renderer.create(<HomeScreen onCreateRoom={onCreateRoom} />); });
    tree!.root.findByProps({ testID: 'create-outing-room' }).props.onPress();
    expect(onCreateRoom).toHaveBeenCalledTimes(1);
    act(() => tree!.unmount());
  });

  it('renders the shared Central Stage in the outing room', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => { tree = renderer.create(<OutingRoomScreen onLeave={jest.fn()} />); });
    expect(tree!.root.findByProps({ testID: 'central-stage' })).toBeTruthy();
    act(() => tree!.unmount());
  });

  it('launches the configured room from the create flow', () => {
    const onCreateRoom = jest.fn();
    let tree: renderer.ReactTestRenderer;
    act(() => { tree = renderer.create(<CreateRoomScreen onCreateRoom={onCreateRoom} />); });
    tree!.root.findByProps({ testID: 'launch-room' }).props.onPress();
    expect(onCreateRoom).toHaveBeenCalledTimes(1);
    act(() => tree!.unmount());
  });

  it('opens the live room from the rooms page', () => {
    const onOpenRoom = jest.fn();
    let tree: renderer.ReactTestRenderer;
    act(() => { tree = renderer.create(<RoomsScreen onOpenRoom={onOpenRoom} onCreateRoom={jest.fn()} />); });
    tree!.root.findByProps({ testID: 'open-active-room' }).props.onPress();
    expect(onOpenRoom).toHaveBeenCalledTimes(1);
    act(() => tree!.unmount());
  });

  it('renders the completed social and profile destinations', () => {
    let friends: renderer.ReactTestRenderer;
    let profile: renderer.ReactTestRenderer;
    act(() => {
      friends = renderer.create(<FriendsScreen />);
      profile = renderer.create(<ProfileScreen />);
    });
    expect(friends!.root.findByType(FriendsScreen)).toBeTruthy();
    expect(profile!.root.findByType(ProfileScreen)).toBeTruthy();
    act(() => {
      friends!.unmount();
      profile!.unmount();
    });
  });

  it('navigates through the tab shell and launches the outing room', () => {
    let tree: renderer.ReactTestRenderer;
    act(() => { tree = renderer.create(<AppContent />); });
    act(() => { tree!.root.findByProps({ testID: 'tab-rooms' }).props.onPress(); });
    expect(tree!.root.findByProps({ testID: 'open-active-room' })).toBeTruthy();
    act(() => { tree!.root.findByProps({ testID: 'tab-create' }).props.onPress(); });
    act(() => { tree!.root.findByProps({ testID: 'launch-room' }).props.onPress(); });
    expect(tree!.root.findByProps({ testID: 'central-stage' })).toBeTruthy();
    act(() => tree!.unmount());
  });
});
