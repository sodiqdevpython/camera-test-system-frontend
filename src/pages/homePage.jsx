import { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';

import { useNavigate } from 'react-router-dom';

import { baseURL } from '../api';
import { tatu } from '../assets';

export default function HomePage() {

    const navigate = useNavigate()

    const [isLoading, setIsLoading] = useState(true);
    const [faculty, setFaculty] = useState(null);
    const [group, setGroup] = useState(null);
    const [theme, setTheme] = useState(null);
    const [selectedTheme, setSelectedTheme] = useState(null);

    const [fio, setFio] = useState('');
    const [fakultet, setFakultet] = useState(null);
    const [gurux, setGurux] = useState(null);

    useEffect(() => {
        async function getData() {
            const response = await axios.get(`${baseURL}/faculty/`);
            setFaculty(response.data);

            const group = await axios.get(`${baseURL}/group/`);
            setGroup(group.data);

            const theme = await axios.get(`${baseURL}/theme/`);
            setTheme(theme.data);

            setIsLoading(false);
        }

        getData();
    }, []);

    const themeOptions = !isLoading
        ? theme.map((t) => ({
            value: t.id,
            label: t.name
        }))
        : [];

    async function handlePostData(event) {
        event.preventDefault();

        if (fakultet === null || gurux === null || selectedTheme === null) {
            alert("Iltimos, barcha maydonlarni to'ldiring!");
            return;
        }

        const data = {
            author: fio,
            faculty: fakultet !== null ? faculty[fakultet].id : null,
            theme: selectedTheme ? selectedTheme.value : null,
            group: gurux !== null ? group[gurux].id : null
        };

        console.log(data);

        try {
            const response = await axios.post(`${baseURL}/create-practise/`, data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log(response.data);
            let id = response.data.id;
            navigate(`/${id}/camera`)
        } catch (error) {
            console.error("Ma'lumotni yuborishda xatolik:", error);
            alert("Nimadir xato ketdi sahifani yangilab qaytadan urinib ko'ring")
        }

    }

    return (
        <div className="absolute top-0 z-[-2] h-full w-screen bg-white bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
            <section className="font-rubik">
                <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
                    <div className="flex items-center mb-6 text-2xl font-semibold text-gray-900">
                        <img className="w-28 h-28 mr-2" src={tatu} alt="logo" />
                    </div>
                    <div className="w-full bg-white rounded-lg shadow md:mt-0 sm:max-w-md xl:p-0">
                        <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                            <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                                Quyidagilarni to'ldiring
                            </h1>
                            <form className="space-y-4 md:space-y-6" onSubmit={handlePostData}>
                                {/* FIO */}
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-900">Ism familiya</label>
                                    <input
                                        type="text"
                                        name="username"
                                        id="username"
                                        autoComplete="current-username"
                                        value={fio}
                                        onChange={(e) => setFio(e.target.value)}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5"
                                        required
                                    />
                                </div>

                                {/* Fakultet */}
                                <select
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                    value={fakultet !== null ? fakultet : ""}
                                    onChange={(e) => setFakultet(e.target.value)}
                                >
                                    <option>Fakultet</option>
                                    {isLoading
                                        ? null
                                        : faculty.map((f, number) => (
                                            <option key={number} value={number}>
                                                {f.name}
                                            </option>
                                        ))}
                                </select>

                                {/* Gurux */}
                                <select
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                    value={gurux !== null ? gurux : ""}
                                    onChange={(e) => setGurux(e.target.value)}
                                >
                                    <option>Gurux</option>
                                    {isLoading
                                        ? null
                                        : group.map((g, number) => (
                                            <option key={number} value={number}>
                                                {g.name}
                                            </option>
                                        ))}
                                </select>


                                {/* Theme (React Select bilan) */}
                                <div>
                                    <label className="block mb-2 text-sm font-medium text-gray-900">Mavzu</label>
                                    <Select
                                        options={themeOptions}
                                        isLoading={isLoading}
                                        placeholder="Tanlang"
                                        value={selectedTheme}
                                        onChange={(selectedOption) => setSelectedTheme(selectedOption)}
                                        className="basic-single"
                                        classNamePrefix="select"
                                    />
                                </div>

                                {/* Submit Button */}
                                <button type="submit" className="w-full text-Light bg-[#2563eb] hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                                    Davom etish
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
