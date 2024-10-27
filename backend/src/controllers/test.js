import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import ingredientsControllers from './ingredientsControllers'; // Adjust the path to your actual service file

const apiBaseUrl = 'http://localhost:5000'; // Mock base URL
const mock = new MockAdapter(axios); // Create a mock instance

describe('Ingredient Service', () => {
    afterEach(() => {
        mock.reset(); // Reset mock after each test
    });

    test('should fetch all ingredients', async () => {
        const dummyData = [{ id: 1, name: 'Tomato' }, { id: 2, name: 'Onion' }];
        mock.onGet(`${apiBaseUrl}/ingredients`).reply(200, dummyData);

        const req = {}; // Mock request
        const res = {
            json: jest.fn(), // Mock response method
        };

        await ingredientsControllers.getIngredients(req, res); // Correct reference

        expect(res.json).toHaveBeenCalledWith(dummyData); // Check if response is as expected
    });

    test('should add a new ingredient', async () => {
        const newIngredient = { name: 'Garlic' };
        const dummyResponse = { id: 3, name: 'Garlic' };
        mock.onPost(`${apiBaseUrl}/ingredients`, newIngredient).reply(201, dummyResponse);

        const req = { body: newIngredient }; // Mock request with body
        const res = {
            status: jest.fn().mockReturnThis(), // Mock status method
            json: jest.fn(), // Mock response method
        };

        await ingredientsControllers.addIngredient(req, res); // Correct reference

        expect(res.status).toHaveBeenCalledWith(201); // Check status code
        expect(res.json).toHaveBeenCalledWith(dummyResponse); // Check if response is as expected
    });

    test('should edit an ingredient', async () => {
        const updatedIngredient = { name: 'Updated Garlic' };
        const dummyResponse = { id: 3, name: 'Updated Garlic' };
        const ingredientId = 3;
        mock.onPut(`${apiBaseUrl}/ingredients/${ingredientId}`, updatedIngredient).reply(200, dummyResponse);

        const req = {
            params: { id: ingredientId },
            body: updatedIngredient,
        };
        const res = {
            json: jest.fn(), // Mock response method
        };

        await ingredientsControllers.editIngredient(req, res); // Correct reference

        expect(res.json).toHaveBeenCalledWith(dummyResponse); // Check if response is as expected
    });

    test('should remove an ingredient', async () => {
        const ingredientId = 3;
        mock.onDelete(`${apiBaseUrl}/ingredients/${ingredientId}`).reply(204);

        const req = { params: { id: ingredientId } };
        const res = {
            status: jest.fn().mockReturnThis(), // Mock status method
            json: jest.fn(), // Mock response method
        };

        await ingredientsControllers.removeIngredient(req, res); // Correct reference

        expect(res.status).toHaveBeenCalledWith(204); // Check status code
        expect(res.json).not.toHaveBeenCalled(); // Ensure no response body
    });

    test('should handle errors', async () => {
        const req = {}; // Mock request
        const res = {
            status: jest.fn().mockReturnThis(), // Mock status method
            json: jest.fn(), // Mock response method
        };

        // Simulate an error for getIngredients
        mock.onGet(`${apiBaseUrl}/ingredients`).reply(500);

        await ingredientsControllers.getIngredients(req, res); // Correct reference

        expect(res.status).toHaveBeenCalledWith(500); // Check if status is 500
        expect(res.json).toHaveBeenCalledWith({ message: expect.any(String) }); // Check if error message is sent
    });
});
