import { getSession, signOut } from 'next-auth/react';
import { getNamedRouteRegex } from 'next/dist/shared/lib/router/utils/route-regex';
import { useContractRead, usePrepareContractWrite, useContractWrite } from 'wagmi'
import { daiAbi, betContractAbi, sep03ContractAddress, requestId } from "../constants"
import { useEffect, useState } from 'react'
import { ethers } from "ethers"

// gets a prop from getServerSideProps
function User({ user }) {
    console.log("user component")

    //STATES
    const [amount, setAmount] = useState("");

    //READ (Aveces muestra un valor viejo en el balance)
    const [balanceOf, setBalanceOf] = useState('')
    const { data, isError, isLoading } = useContractRead({
        chain: 42,
        addressOrName: '0x29282139fD1A88ccAED6d3bb7f547192144C0f95',
        contractInterface: daiAbi,
        functionName: 'balanceOf',
        args: [user.address]
    })

    //utilizo useffect porque sino da un error de hidratacion https://nextjs.org/docs/messages/react-hydration-error
    useEffect(() => {
        var _balanceOf = ethers.utils.formatEther(data)
        setBalanceOf(_balanceOf)
    }, [balanceOf])

    // WRITE
    const { config, error } = usePrepareContractWrite({
        chainId: 42,
        addressOrName: '0x29282139fD1A88ccAED6d3bb7f547192144C0f95',
        contractInterface: daiAbi,
        functionName: 'faucet',
        args: [amount],
    })
    const { write } = useContractWrite(config)

    const handleSubmit = (event) => {
        event.preventDefault();
        console.log("amount:", amount)
        write()
      }

    return (
        <div>
            <button onClick={() => signOut({ redirect: '/signin' })}>Sign out</button>
            <h4>User session:</h4>
            <pre>{JSON.stringify(user, null, 2)}</pre>
            <h5>Read function:</h5>
            <div>Balance:{balanceOf}</div>
            <form onSubmit={handleSubmit}>
                <label htmlFor="faucet">Faucet:</label>
                <input type="text" 
                id="faucet" name="faucet" 
                onChange={(e) => setAmount(e.target.value)}
                />
                <input type="submit" />
            </form>
        </div>
    );
}

export async function getServerSideProps(context) {
    const session = await getSession(context);
    // redirect if not authenticated
    if (!session) {
        return {
            redirect: {
                destination: '/signin',
                permanent: false,
            },
        };
    }

    console.log("server side!")
    return {
        props: { user: session.user },
    };
}

export default User;