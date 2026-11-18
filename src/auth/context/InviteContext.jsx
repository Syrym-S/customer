import { createContext, useContext, useState } from 'react';

const inviteContext = createContext();

export const useRegister = () => useContext(inviteContext);

export function InviteProvider({children}){
    const [invite, setInvite] = useState('')

    return (
        <inviteContext.Provider value={{invite,setInvite}}>
            {children}
        </inviteContext.Provider>
    );
}